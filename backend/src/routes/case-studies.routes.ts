import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { verifyToken, requireAdmin, AuthRequest } from '../middleware/auth.middleware';
import { uploadImage } from '../middleware/upload.middleware';

const router = Router();

const slugify = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();

router.get('/', async (_req: Request, res: Response) => {
    try {
        const caseStudies = await prisma.caseStudy.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' } });
        res.json(caseStudies);
    } catch {
        res.status(500).json({ error: 'Failed to fetch case studies' });
    }
});

router.get('/:slug', async (req: Request, res: Response) => {
    try {
        const caseStudy = await prisma.caseStudy.findFirst({
            where: { OR: [{ slug: String(req.params.slug) }, { id: Number(req.params.slug) || 0 }] },
        });
        if (!caseStudy) { res.status(404).json({ error: 'Case study not found' }); return; }
        res.json(caseStudy);
    } catch {
        res.status(500).json({ error: 'Failed to fetch case study' });
    }
});

router.post('/', verifyToken, requireAdmin, uploadImage.single('image'), async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, body } = req.body;
        if (!title) { res.status(400).json({ error: 'Title required' }); return; }
        const slug = slugify(title);
        const imageUrl = req.file ? `/uploads/images/${req.file.filename}` : req.body.imageUrl;
        const caseStudy = await prisma.caseStudy.create({ data: { title, slug, description, body, imageUrl } });
        res.status(201).json(caseStudy);
    } catch {
        res.status(500).json({ error: 'Failed to create case study' });
    }
});

router.put('/:id', verifyToken, requireAdmin, uploadImage.single('image'), async (req: AuthRequest, res: Response) => {
    try {
        const current = await prisma.caseStudy.findUnique({ where: { id: Number(req.params.id) } });
        if (!current) { res.status(404).json({ error: 'Case study not found' }); return; }

        const caseStudy = await prisma.caseStudy.update({
            where: { id: Number(req.params.id) },
            data: {
                title: req.body.title ?? current.title,
                description: req.body.description ?? current.description,
                body: req.body.body ?? current.body,
                imageUrl: req.file ? `/uploads/images/${req.file.filename}` : (req.body.imageUrl || current.imageUrl),
            },
        });
        res.json(caseStudy);
    } catch {
        res.status(500).json({ error: 'Failed to update case study' });
    }
});

router.delete('/:id', verifyToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.caseStudy.update({ where: { id: Number(req.params.id) }, data: { active: false } });
        res.json({ message: 'Case study hidden' });
    } catch {
        res.status(500).json({ error: 'Failed to delete case study' });
    }
});

export default router;
