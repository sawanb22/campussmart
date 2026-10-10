import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { syncToSpreadsheet } from '../services/spreadsheet.service';
import { isValidEmail, isValidPhone, isValidPincode, normalizePhone } from '../lib/validation';
import { uploadResume } from '../middleware/upload.middleware';
import { sendOtpEmail, generateOtp } from '../lib/email';
import { otpLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

const getOptionalUser = async (req: Request) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (user && user.emailVerified) return user;
        return null;
    } catch {
        return null;
    }
};

// POST /api/contact
router.post('/', uploadResume.single('resume'), async (req: Request, res: Response) => {
    try {
        const { name, email, phone, institution, subject, role, message } = req.body;
        if (!name || !email || !phone || !message) {
            res.status(400).json({ error: 'Name, email, phone, and message are required' });
            return;
        }
        if (!isValidEmail(email)) {
            res.status(400).json({ error: 'Please enter a valid email address' });
            return;
        }
        if (!isValidPhone(phone)) {
            res.status(400).json({ error: 'Please enter a valid phone number (e.g. +91 98765 43210 or international)' });
            return;
        }
        const normalizedPhone = normalizePhone(phone);
        const isJobApplication = typeof subject === 'string' && subject.startsWith('Job Application:');
        if (isJobApplication && (!role || !req.file)) {
            res.status(400).json({ error: 'Role and resume are required for job applications' });
            return;
        }
        const storedMessage = institution
            ? `Institution: ${institution}\n\n${message}`
            : message;
        const enquiry = await prisma.contactEnquiry.create({
            data: {
                name: String(name).trim(),
                email: String(email).trim().toLowerCase(),
                phone: normalizedPhone,
                subject,
                role,
                message: storedMessage,
                resumeFilename: req.file?.filename,
                resumeOriginalName: req.file?.originalname,
                resumeMimeType: req.file?.mimetype,
                resumeSize: req.file?.size,
            },
        });
        // Non-blocking sync: external spreadsheet errors should never fail customer enquiry persistence
        syncToSpreadsheet({ type: 'Contact Enquiry', id: enquiry.id, name, email, phone: normalizedPhone, institution, subject, role, message, resumeOriginalName: req.file?.originalname, createdAt: enquiry.createdAt })
            .catch((sheetErr) => console.error('Spreadsheet sync error (non-fatal):', sheetErr));
        res.status(201).json({ message: 'Enquiry submitted successfully', id: enquiry.id });
    } catch (err) {
        console.error('Failed to submit enquiry in POST /api/contact:', err);
        res.status(500).json({ error: 'Failed to submit enquiry. Please try again.' });
    }
});

// POST /api/contact/send-quote-otp
router.post('/send-quote-otp', otpLimiter, async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ error: 'Official email address is required' });
            return;
        }
        if (!isValidEmail(email)) {
            res.status(400).json({ error: 'Please enter a valid official email address' });
            return;
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Invalidate previous unused quote OTPs for this email
        await prisma.otpCode.updateMany({
            where: { email: normalizedEmail, purpose: 'quote', used: false },
            data: { used: true },
        });

        const code = generateOtp();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await prisma.otpCode.create({
            data: { email: normalizedEmail, code, purpose: 'quote', expiresAt },
        });

        await sendOtpEmail(normalizedEmail, code, 'quote');

        res.json({ message: 'Verification code sent to your official email address' });
    } catch (err) {
        console.error('send-quote-otp error:', err);
        res.status(500).json({ error: 'Failed to send verification code. Please try again.' });
    }
});

// POST /api/contact/quote
router.post('/quote', async (req: Request, res: Response) => {
    try {
        const { name, email, phone, institution, pincode, items, message, otpCode } = req.body;
        if (!name || !email || !phone || !pincode || !message) {
            res.status(400).json({ error: 'Name, email, phone, pincode, and message are required' });
            return;
        }
        if (!isValidEmail(email)) {
            res.status(400).json({ error: 'Please enter a valid email address' });
            return;
        }
        if (!isValidPhone(phone)) {
            res.status(400).json({ error: 'Please enter a valid phone number (e.g. +91 98765 43210 or international)' });
            return;
        }
        if (!isValidPincode(pincode)) {
            res.status(400).json({ error: 'Please enter a valid 6-digit pincode' });
            return;
        }

        const normalizedEmail = email.trim().toLowerCase();
        const currentUser = await getOptionalUser(req);
        const isVerifiedLoggedIn = currentUser && currentUser.email.toLowerCase() === normalizedEmail;

        // If not a verified logged-in user, validate OTP code
        if (!isVerifiedLoggedIn) {
            if (!otpCode) {
                res.status(400).json({ error: 'Verification code is required to submit quotation request' });
                return;
            }

            const record = await prisma.otpCode.findFirst({
                where: {
                    email: normalizedEmail,
                    code: String(otpCode).trim(),
                    purpose: 'quote',
                    used: false,
                },
                orderBy: { createdAt: 'desc' },
            });

            if (!record) {
                res.status(400).json({ error: 'Invalid verification code. Please check and try again.' });
                return;
            }

            if (record.expiresAt < new Date()) {
                res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
                return;
            }

            // Mark OTP as used
            await prisma.otpCode.update({
                where: { id: record.id },
                data: { used: true },
            });
        }

        const quote = await prisma.quoteRequest.create({
            data: { name, email: normalizedEmail, phone, institution, items, message },
        });

        // Non-blocking sync: external spreadsheet errors should never fail customer quote persistence
        syncToSpreadsheet({
            type: 'Quote Request',
            id: quote.id,
            name,
            email: normalizedEmail,
            phone,
            institution,
            items,
            message,
            createdAt: quote.createdAt,
        }).catch((sheetError) => console.error('Spreadsheet sync error (non-fatal):', sheetError));

        res.status(201).json({ message: 'Quote request submitted successfully', id: quote.id });
    } catch (err) {
        console.error('Failed to submit quote request in database:', err);
        res.status(500).json({ error: 'Failed to submit quote request. Please check your details and try again.' });
    }
});

export default router;
