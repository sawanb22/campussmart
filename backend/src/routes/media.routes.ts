import { Router, Request, Response } from 'express';
import { uploadMediaImage } from '../middleware/upload.middleware';
import { verifyToken, requireAdmin, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

router.post('/', verifyToken, requireAdmin, uploadMediaImage.single('image'), (req: AuthRequest, res: Response) => {
    if (!req.file) {
        res.status(400).json({ error: 'An image file is required' });
        return;
    }

    res.status(201).json({
        url: `/uploads/media/${req.file.filename}`,
        filename: req.file.filename,
    });
});

export default router;
