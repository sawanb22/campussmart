import { Router, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { uploadMedia, validateMediaFileSize } from '../middleware/upload.middleware';
import { verifyToken, requireAdmin, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Upload rate limiter: 60 uploads per 15 minutes per IP
const mediaUploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    message: { error: 'Too many upload attempts. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post(
    '/',
    mediaUploadLimiter,
    verifyToken,
    requireAdmin,
    (req: AuthRequest, res: Response, next: NextFunction) => {
        // Accept either 'media' or 'image' field for seamless frontend flexibility
        const upload = uploadMedia.fields([
            { name: 'media', maxCount: 1 },
            { name: 'image', maxCount: 1 },
        ]);
        upload(req, res, (err: any) => {
            if (err) return next(err);
            const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
            const file = files?.media?.[0] || files?.image?.[0];
            if (!file) {
                res.status(400).json({ error: 'A media file (image or video) is required' });
                return;
            }

            // Enforce strict split limits (5MB for images, 100MB for videos)
            const sizeCheck = validateMediaFileSize(file);
            if (!sizeCheck.valid) {
                res.status(400).json({ error: sizeCheck.error });
                return;
            }

            const isVideo = file.mimetype.startsWith('video/');
            res.status(201).json({
                url: `/uploads/media/${file.filename}`,
                filename: file.filename,
                mimetype: file.mimetype,
                isVideo,
                size: file.size,
            });
        });
    }
);

export default router;
