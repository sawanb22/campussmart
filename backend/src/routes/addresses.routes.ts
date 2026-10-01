import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { verifyToken, AuthRequest } from '../middleware/auth.middleware';
import { isValidPincode } from '../lib/validation';

const router = Router();


router.get('/', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const addresses = await prisma.address.findMany({
            where: { userId: req.user!.id },
            orderBy: [{ isDefault: 'desc' }, { id: 'desc' }],
        });
        res.json(addresses);
    } catch {
        res.status(500).json({ error: 'Failed to fetch addresses' });
    }
});

router.post('/', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const { type, line1, line2, city, state, pincode, isDefault } = req.body;
        if (!type || !line1 || !city || !state || !isValidPincode(pincode)) {
            res.status(400).json({ error: 'Please provide complete address details and a valid 6-digit pincode' });
            return;
        }

        const existingCount = await prisma.address.count({ where: { userId: req.user!.id } });
        const shouldBeDefault = existingCount === 0 || Boolean(isDefault);

        const address = await prisma.$transaction(async (tx) => {
            if (shouldBeDefault) {
                await tx.address.updateMany({
                    where: { userId: req.user!.id },
                    data: { isDefault: false },
                });
            }
            return tx.address.create({
                data: {
                    userId: req.user!.id,
                    type,
                    line1,
                    line2,
                    city,
                    state,
                    pincode,
                    isDefault: shouldBeDefault,
                },
            });
        });

        res.status(201).json(address);
    } catch {
        res.status(500).json({ error: 'Failed to add address' });
    }
});

router.put('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const { type, line1, line2, city, state, pincode, isDefault } = req.body;
        if (!type || !line1 || !city || !state || !isValidPincode(pincode)) {
            res.status(400).json({ error: 'Please provide complete address details and a valid 6-digit pincode' });
            return;
        }
        const existing = await prisma.address.findFirst({ where: { id: Number(req.params.id), userId: req.user!.id } });
        if (!existing) { res.status(404).json({ error: 'Address not found' }); return; }

        const shouldBeDefault = isDefault !== undefined ? Boolean(isDefault) : existing.isDefault;

        const address = await prisma.$transaction(async (tx) => {
            if (shouldBeDefault && !existing.isDefault) {
                await tx.address.updateMany({
                    where: { userId: req.user!.id },
                    data: { isDefault: false },
                });
            }
            return tx.address.update({
                where: { id: existing.id },
                data: {
                    type,
                    line1,
                    line2,
                    city,
                    state,
                    pincode,
                    isDefault: shouldBeDefault,
                },
            });
        });

        res.json(address);
    } catch {
        res.status(500).json({ error: 'Failed to update address' });
    }
});

// PATCH /api/addresses/:id/default - Set an address as default
router.patch('/:id/default', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const addressId = Number(req.params.id);
        const existing = await prisma.address.findFirst({ where: { id: addressId, userId: req.user!.id } });
        if (!existing) { res.status(404).json({ error: 'Address not found' }); return; }

        const address = await prisma.$transaction(async (tx) => {
            await tx.address.updateMany({
                where: { userId: req.user!.id },
                data: { isDefault: false },
            });
            return tx.address.update({
                where: { id: existing.id },
                data: { isDefault: true },
            });
        });

        res.json(address);
    } catch {
        res.status(500).json({ error: 'Failed to set default address' });
    }
});

router.delete('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const addressId = Number(req.params.id);
        const existing = await prisma.address.findFirst({ where: { id: addressId, userId: req.user!.id } });
        if (!existing) { res.status(404).json({ error: 'Address not found' }); return; }

        await prisma.$transaction(async (tx) => {
            await tx.address.delete({ where: { id: existing.id } });
            if (existing.isDefault) {
                const remaining = await tx.address.findFirst({
                    where: { userId: req.user!.id },
                    orderBy: { id: 'desc' },
                });
                if (remaining) {
                    await tx.address.update({
                        where: { id: remaining.id },
                        data: { isDefault: true },
                    });
                }
            }
        });

        res.json({ message: 'Address deleted' });
    } catch {
        res.status(500).json({ error: 'Failed to delete address' });
    }
});

export default router;
