import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { verifyToken, requireAdmin, AuthRequest } from '../middleware/auth.middleware';

const router = Router();


const ALLOWED_STATUSES = new Set(['pending', 'processing', 'shipped', 'delivered', 'cancelled']);

// GET /api/orders (my orders)
router.get('/', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: req.user!.id },
            include: { orderitem: { include: { product: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json(orders.map((o) => ({ ...o, items: o.orderitem })));
    } catch {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// POST /api/orders
router.post('/', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const { items, notes } = req.body; // items: [{productId, qty}]
        if (!Array.isArray(items) || items.length === 0) {
            res.status(400).json({ error: 'No items provided' });
            return;
        }

        for (const item of items) {
            const qty = Number(item.qty);
            const productId = Number(item.productId);
            if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(qty) || qty <= 0) {
                res.status(400).json({ error: 'Each item must have a positive integer productId and qty' });
                return;
            }
        }

        const productIds = items.map((i: { productId: number }) => Number(i.productId));
        const products = await prisma.product.findMany({
            where: { id: { in: productIds }, active: true }
        });

        if (products.length !== productIds.length) {
            const foundIds = new Set(products.map((p) => p.id));
            const missing = productIds.filter((id: number) => !foundIds.has(id));
            res.status(400).json({ error: `Product(s) ${missing.join(', ')} not found or inactive` });
            return;
        }

        let total = 0;
        const orderItems = items.map((item: { productId: number; qty: number }) => {
            const product = products.find((p) => p.id === Number(item.productId))!;
            const unitPrice = product.price;
            total += unitPrice * Number(item.qty);
            return { productId: Number(item.productId), qty: Number(item.qty), unitPrice };
        });

        const order = await prisma.order.create({
            data: { userId: req.user!.id, total, notes, orderitem: { create: orderItems } },
            include: { orderitem: { include: { product: true } } },
        });
        res.status(201).json({ ...order, items: order.orderitem });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to create order';
        res.status(500).json({ error: msg });
    }
});

// GET /api/orders/all (admin)
router.get('/all', verifyToken, requireAdmin, async (_req: AuthRequest, res: Response) => {
    try {
        const orders = await prisma.order.findMany({
            include: { user: { select: { name: true, email: true } }, orderitem: { include: { product: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json(orders.map((o) => ({ ...o, items: o.orderitem })));
    } catch {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// PUT /api/orders/:id/status (admin)
router.put('/:id/status', verifyToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.body;
        const normalized = String(status || '').trim().toLowerCase();
        if (!ALLOWED_STATUSES.has(normalized)) {
            res.status(400).json({ error: `Invalid status. Allowed values: ${Array.from(ALLOWED_STATUSES).join(', ')}` });
            return;
        }
        const order = await prisma.order.update({
            where: { id: Number(req.params.id) },
            data: { status: normalized },
            include: { orderitem: { include: { product: true } } },
        });
        res.json({ ...order, items: order.orderitem });
    } catch {
        res.status(500).json({ error: 'Failed to update order' });
    }
});

export default router;
