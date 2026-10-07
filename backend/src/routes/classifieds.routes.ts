import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { verifyToken, requireAdmin, optionalAuth, AuthRequest } from '../middleware/auth.middleware';
import { uploadImage } from '../middleware/upload.middleware';

const router = Router();


router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
        const isAdmin = req.user?.role === 'admin';
        const requestedStatus = req.query.status ? String(req.query.status) : undefined;
        const status = (isAdmin && requestedStatus) ? requestedStatus : 'approved';
        const where = { status };
        const classifieds = await prisma.classified.findMany({
            where, include: { user: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' }
        });
        res.json(classifieds);
    } catch {
        res.status(500).json({ error: 'Failed to fetch classifieds' });
    }
});

router.get('/all', verifyToken, requireAdmin, async (_req: AuthRequest, res: Response) => {
    try {
        const classifieds = await prisma.classified.findMany({
            include: { user: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' }
        });
        res.json(classifieds);
    } catch {
        res.status(500).json({ error: 'Failed to fetch classifieds' });
    }
});

router.post('/', verifyToken, uploadImage.single('image'), async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, price } = req.body;
        const imageUrl = req.file ? `/uploads/images/${req.file.filename}` : req.body.imageUrl;
        const classified = await prisma.classified.create({
            data: { userId: req.user!.id, title, description, price: price ? Number(price) : null, imageUrl, status: 'pending' },
        });
        res.status(201).json(classified);
    } catch {
        res.status(500).json({ error: 'Failed to create classified' });
    }
});

router.put('/:id/status', verifyToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const classified = await prisma.classified.update({
            where: { id: Number(req.params.id) }, data: { status: req.body.status }
        });
        res.json(classified);
    } catch {
        res.status(500).json({ error: 'Failed to update classified' });
    }
});

router.delete('/:id', verifyToken, requireAdmin, async (_req: AuthRequest, res: Response) => {
    try {
        await prisma.classified.delete({ where: { id: Number(_req.params.id) } });
        res.json({ message: 'Classified deleted' });
    } catch {
        res.status(500).json({ error: 'Failed to delete classified' });
    }
});

export default router;
