import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import prisma from '../lib/prisma';
import { verifyToken, requireAdmin, AuthRequest } from '../middleware/auth.middleware';
import { RESUMES_DIR } from '../lib/uploads-dir';

const router = Router();


// GET /api/admin/stats
router.get('/stats', verifyToken, requireAdmin, async (_req: AuthRequest, res: Response) => {
    try {
        const [users, products, orders, enquiries, quotes, classifieds, revenue] = await Promise.all([
            prisma.user.count(),
            prisma.product.count({ where: { active: true } }),
            prisma.order.count(),
            prisma.contactEnquiry.count({ where: { read: false } }),
            prisma.quoteRequest.count({ where: { read: false } }),
            prisma.classified.count({ where: { status: 'pending' } }),
            prisma.order.aggregate({ _sum: { total: true } }),
        ]);
        res.json({
            users, products, orders, unreadEnquiries: enquiries, unreadQuotes: quotes,
            pendingClassifieds: classifieds, totalRevenue: revenue._sum.total || 0,
        });
    } catch {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// GET /api/admin/users
router.get('/users', verifyToken, requireAdmin, async (_req: AuthRequest, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, phone: true, institution: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json(users);
    } catch (error) {
        console.error('Failed to fetch users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// PUT /api/admin/users/:id/role - Promote or demote user role
router.put('/users/:id/role', verifyToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const userId = Number(req.params.id);
        const { role } = req.body;
        
        // Validate role
        if (!role || !['user', 'admin'].includes(role)) {
            res.status(400).json({ error: 'Invalid role. Must be "user" or "admin"' });
            return;
        }
        
        // Check user exists
        const userExists = await prisma.user.findUnique({ where: { id: userId } });
        if (!userExists) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        
        const user = await prisma.user.update({ 
            where: { id: userId }, 
            data: { role } 
        });
        console.log(`User ${userId} role changed to ${role} by admin ${req.user?.id}`);
        res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } catch (error) {
        console.error('Failed to update user role:', error);
        res.status(500).json({ error: 'Failed to update user role' });
    }
});

// GET /api/admin/enquiries
router.get('/enquiries', verifyToken, requireAdmin, async (_req: AuthRequest, res: Response) => {
    try {
        const [contacts, quotes] = await Promise.all([
            prisma.contactEnquiry.findMany({ orderBy: { createdAt: 'desc' } }),
            prisma.quoteRequest.findMany({ orderBy: { createdAt: 'desc' } }),
        ]);
        res.json({ contacts, quotes });
    } catch {
        res.status(500).json({ error: 'Failed to fetch enquiries' });
    }
});

// GET /api/admin/enquiries/contact/:id/resume
router.get('/enquiries/contact/:id/resume', verifyToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const enquiry = await prisma.contactEnquiry.findUnique({ where: { id: Number(req.params.id) } });
        if (!enquiry?.resumeFilename) {
            res.status(404).json({ error: 'Resume not found' });
            return;
        }
        const filePath = path.resolve(RESUMES_DIR, enquiry.resumeFilename);
        if (!filePath.startsWith(`${path.resolve(RESUMES_DIR)}${path.sep}`) || !fs.existsSync(filePath)) {
            res.status(404).json({ error: 'Resume file not found' });
            return;
        }
        res.download(filePath, enquiry.resumeOriginalName || enquiry.resumeFilename);
    } catch {
        res.status(500).json({ error: 'Failed to download resume' });
    }
});

// PUT /api/admin/enquiries/contact/:id/read
router.put('/enquiries/contact/:id/read', verifyToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.contactEnquiry.update({ where: { id: Number(req.params.id) }, data: { read: true } });
        res.json({ message: 'Marked as read' });
    } catch {
        res.status(500).json({ error: 'Failed to update enquiry' });
    }
});

// PUT /api/admin/enquiries/quote/:id/read
router.put('/enquiries/quote/:id/read', verifyToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.quoteRequest.update({ where: { id: Number(req.params.id) }, data: { read: true } });
        res.json({ message: 'Marked as read' });
    } catch {
        res.status(500).json({ error: 'Failed to update quote' });
    }
});

// GET /api/admin/wishlist-report - every wishlist item with the owning user's
// contact details, for the sales team to follow up on and prepare quotations.
router.get('/wishlist-report', verifyToken, requireAdmin, async (_req: AuthRequest, res: Response) => {
    try {
        const items = await prisma.wishlistItem.findMany({
            include: {
                user: { select: { id: true, name: true, email: true, phone: true, institution: true } },
                product: { include: { category: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(items);
    } catch (error) {
        console.error('Failed to fetch wishlist report:', error);
        res.status(500).json({ error: 'Failed to fetch wishlist report' });
    }
});

const escapeCsvValue = (value: string) => `"${value.replace(/"/g, '""')}"`;

// GET /api/admin/wishlist-report/export - same data as a downloadable CSV file.
router.get('/wishlist-report/export', verifyToken, requireAdmin, async (_req: AuthRequest, res: Response) => {
    try {
        const items = await prisma.wishlistItem.findMany({
            include: {
                user: { select: { name: true, email: true, phone: true, institution: true } },
                product: { include: { category: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        const header = ['User Name', 'Email', 'Phone', 'Institution', 'Item', 'Category', 'Date Added'];
        const rows = items.map((item) => {
            const itemName = item.product?.name ?? item.designTitle ?? '';
            const category = item.product?.category?.name ?? item.pageSlug ?? '';
            return [
                item.user.name,
                item.user.email,
                item.user.phone ?? '',
                item.user.institution ?? '',
                itemName,
                category,
                item.createdAt.toISOString(),
            ]
                .map((value) => escapeCsvValue(String(value)))
                .join(',');
        });
        const csv = [header.map(escapeCsvValue).join(','), ...rows].join('\n');

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="wishlist-report-${Date.now()}.csv"`);
        res.send(csv);
    } catch (error) {
        console.error('Failed to export wishlist report:', error);
        res.status(500).json({ error: 'Failed to export wishlist report' });
    }
});

export default router;
