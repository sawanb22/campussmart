import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { verifyToken, AuthRequest } from '../middleware/auth.middleware';

const router = Router();


// GET /api/wishlist
router.get('/', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const items = await prisma.wishlistItem.findMany({
            where: {
                userId: req.user!.id,
                OR: [
                    { productId: null },
                    { product: { active: true } },
                ],
            },
            include: { product: { include: { category: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json(items);
    } catch {
        res.status(500).json({ error: 'Failed to fetch wishlist' });
    }
});

// POST /api/wishlist
// Accepts either { productId, quantity? } for a real product, or { designKey, designTitle, designImage?, pageSlug?, quantity? }
// for a CMS "design" card (labs/libraries/sports-infra pages) that isn't a purchasable product yet.
router.post('/', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const { productId, designKey, designTitle, designImage, pageSlug, quantity } = req.body;
        const initialQty = quantity && Number.isInteger(Number(quantity)) && Number(quantity) > 0
            ? Math.min(10000, Number(quantity))
            : 1;

        if (productId !== undefined && productId !== null) {
            const numId = Number(productId);
            if (!Number.isInteger(numId) || numId <= 0) {
                res.status(400).json({ error: 'Invalid productId' });
                return;
            }
            const product = await prisma.product.findUnique({
                where: { id: numId },
                include: { category: true },
            });
            if (!product) {
                res.status(404).json({ error: 'Product not found' });
                return;
            }
            if (!product.active) {
                res.status(400).json({ error: 'Product is no longer available' });
                return;
            }
            const item = await prisma.wishlistItem.upsert({
                where: { userId_productId: { userId: req.user!.id, productId: numId } },
                update: { quantity: initialQty },
                create: { userId: req.user!.id, productId: numId, quantity: initialQty },
                include: { product: { include: { category: true } } },
            });
            return res.status(201).json(item);
        }
        if (designKey && designTitle) {
            const item = await prisma.wishlistItem.upsert({
                where: { userId_designKey: { userId: req.user!.id, designKey: String(designKey).trim() } },
                update: { quantity: initialQty },
                create: {
                    userId: req.user!.id,
                    designKey: String(designKey).trim(),
                    designTitle: String(designTitle).trim(),
                    designImage: designImage ? String(designImage) : null,
                    pageSlug: pageSlug ? String(pageSlug).trim() : null,
                    quantity: initialQty,
                },
            });
            return res.status(201).json(item);
        }
        res.status(400).json({ error: 'productId or designKey with designTitle is required' });
    } catch {
        res.status(500).json({ error: 'Failed to add to wishlist' });
    }
});

// PATCH /api/wishlist/:id/quantity - update unit count requested
router.patch('/:id/quantity', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const id = Number(req.params.id);
        const parsedQuantity = Math.max(1, Math.min(10000, Number(req.body.quantity) || 1));
        const item = await prisma.wishlistItem.findFirst({
            where: { id, userId: req.user!.id },
        });
        if (!item) {
            res.status(404).json({ error: 'Wishlist item not found' });
            return;
        }
        const updated = await prisma.wishlistItem.update({
            where: { id },
            data: { quantity: parsedQuantity },
            include: { product: { include: { category: true } } },
        });
        res.json(updated);
    } catch {
        res.status(500).json({ error: 'Failed to update item quantity' });
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
