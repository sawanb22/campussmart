import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { verifyToken, requireAdmin, AuthRequest } from '../middleware/auth.middleware';
import { uploadPDF } from '../middleware/upload.middleware';

const router = Router();


router.get('/', async (_req: Request, res: Response) => {
    try {
        const catalogues = await prisma.catalogue.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' } });
        res.json(catalogues);
    } catch {
        res.status(500).json({ error: 'Failed to fetch catalogues' });
    }
});

router.post('/', verifyToken, requireAdmin, uploadPDF.single('file'), async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, thumbnailUrl } = req.body;
        const fileUrl = req.file ? `/uploads/catalogues/${req.file.filename}` : req.body.fileUrl;
        if (!fileUrl) { res.status(400).json({ error: 'File required' }); return; }
        const catalogue = await prisma.catalogue.create({ data: { title, description, fileUrl, thumbnailUrl } });
        res.status(201).json(catalogue);
    } catch {
        res.status(500).json({ error: 'Failed to create catalogue' });
    }
});

router.put('/:id', verifyToken, requireAdmin, uploadPDF.single('file'), async (req: AuthRequest, res: Response) => {
    try {
        const current = await prisma.catalogue.findUnique({ where: { id: Number(req.params.id) } });
        if (!current) { res.status(404).json({ error: 'Catalogue not found' }); return; }

        const catalogue = await prisma.catalogue.update({
            where: { id: Number(req.params.id) },
            data: {
                title: req.body.title ?? current.title,
                description: req.body.description ?? current.description,
                thumbnailUrl: req.body.thumbnailUrl ?? current.thumbnailUrl,
                fileUrl: req.file ? `/uploads/catalogues/${req.file.filename}` : (req.body.fileUrl || current.fileUrl),
            },
        });
        res.json(catalogue);
    } catch {
        res.status(500).json({ error: 'Failed to update catalogue' });
    }
});

router.delete('/:id', verifyToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.catalogue.update({ where: { id: Number(req.params.id) }, data: { active: false } });
        res.json({ message: 'Catalogue hidden' });
    } catch {
        res.status(500).json({ error: 'Failed to delete catalogue' });
    }
});

export default router;
