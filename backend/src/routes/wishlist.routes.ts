import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { verifyToken, AuthRequest } from '../middleware/auth.middleware';

const router = Router();


// GET /api/wishlist
router.get('/', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const items = await prisma.wishlistItem.findMany({
            where: { userId: req.user!.id },
            include: { product: { include: { category: true } } },
        });
        res.json(items);
    } catch {
        res.status(500).json({ error: 'Failed to fetch wishlist' });
    }
});

// POST /api/wishlist
// Accepts either { productId } for a real product, or { designKey, designTitle, designImage?, pageSlug? }
// for a CMS "design" card (labs/libraries/sports-infra pages) that isn't a purchasable product yet.
router.post('/', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const { productId, designKey, designTitle, designImage, pageSlug } = req.body;
        if (productId) {
            const item = await prisma.wishlistItem.upsert({
                where: { userId_productId: { userId: req.user!.id, productId: Number(productId) } },
                update: {},
                create: { userId: req.user!.id, productId: Number(productId) },
                include: { product: true },
            });
            return res.status(201).json(item);
        }
        if (designKey && designTitle) {
            const item = await prisma.wishlistItem.upsert({
                where: { userId_designKey: { userId: req.user!.id, designKey: String(designKey) } },
                update: {},
                create: {
                    userId: req.user!.id,
                    designKey: String(designKey),
                    designTitle: String(designTitle),
                    designImage: designImage ? String(designImage) : null,
                    pageSlug: pageSlug ? String(pageSlug) : null,
                },
            });
            return res.status(201).json(item);
        }
        res.status(400).json({ error: 'productId or designKey with designTitle is required' });
    } catch {
        res.status(500).json({ error: 'Failed to add to wishlist' });
    }
});

// DELETE /api/wishlist/design/:designKey
router.delete('/design/:designKey', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.wishlistItem.deleteMany({
            where: { userId: req.user!.id, designKey: String(req.params.designKey) },
        });
        res.json({ message: 'Removed from wishlist' });
    } catch {
        res.status(500).json({ error: 'Failed to remove from wishlist' });
    }
});

// DELETE /api/wishlist/:productId
router.delete('/:productId', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.wishlistItem.deleteMany({
            where: { userId: req.user!.id, productId: Number(req.params.productId) },
        });
        res.json({ message: 'Removed from wishlist' });
    } catch {
        res.status(500).json({ error: 'Failed to remove from wishlist' });
    }
});

export default router;
