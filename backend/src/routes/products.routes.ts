import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { verifyToken, requireAdmin, AuthRequest } from '../middleware/auth.middleware';
import { uploadImage } from '../middleware/upload.middleware';
import path from 'path';

const router = Router();
const CATEGORY_PAGES = new Set(['furniture', 'libraries', 'labs', 'sports', 'ai-ml', 'tech-infra']);


// GET /api/products
router.get('/', async (req: Request, res: Response) => {
    try {
        const { category, search, featured, sort = 'newest', page = '1', limit = '20' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where: Record<string, unknown> = { active: true };
        if (category && category !== 'all') {
            const categorySlugs = String(category).split(',').map((slug) => slug.trim()).filter(Boolean);
            const categoryRows = await prisma.category.findMany({
                where: { slug: { in: categorySlugs } },
                select: { id: true },
            });
            where.categoryId = { in: categoryRows.map((cat) => cat.id) };
        }
        if (search) where.name = { contains: String(search), mode: 'insensitive' };
        if (featured === 'true') where.featured = true;
        const orderBy = sort === 'price-asc'
            ? { price: 'asc' as const }
            : sort === 'price-desc'
                ? { price: 'desc' as const }
                : sort === 'name-asc'
                    ? { name: 'asc' as const }
                    : sort === 'popularity'
                        ? { reviewCount: 'desc' as const }
                        : { createdAt: 'desc' as const };
        const [products, total] = await Promise.all([
            prisma.product.findMany({ where, include: { category: true }, skip, take: Number(limit), orderBy }),
            prisma.product.count({ where }),
        ]);
        res.json({ products, total, page: Number(page), limit: Number(limit) });
    } catch {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// GET /api/products/categories
router.get('/categories', async (req: Request, res: Response) => {
    try {
        const page = String(req.query.page || '').trim();
        const categories = await prisma.category.findMany({
            where: page ? { page } : undefined,
            orderBy: [{ page: 'asc' }, { name: 'asc' }],
            include: { _count: { select: { product: true } } },
        });
        res.json(categories.map(({ _count, ...category }) => ({ ...category, _count: { products: _count.product } })));
    } catch {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// POST /api/products/categories (admin)
router.post('/categories', verifyToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { name, slug, page } = req.body;
        if (!name || !page || !CATEGORY_PAGES.has(page)) {
            return res.status(400).json({ error: 'Category name and a valid page are required' });
        }
        const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const category = await prisma.category.create({
            data: { name, slug: finalSlug, page }
        });
        res.status(201).json(category);
    } catch (err: any) {
        res.status(500).json({ error: err.message || 'Failed to create category' });
    }
});

// PUT /api/products/categories/:id (admin)
router.put('/categories/:id', verifyToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { name, slug, page } = req.body;
        if (page !== undefined && !CATEGORY_PAGES.has(page)) {
            return res.status(400).json({ error: 'Invalid category page' });
        }
        const category = await prisma.category.update({
            where: { id: Number(req.params.id) },
            data: { name, slug, page }
        });
        res.json(category);
    } catch (err: any) {
        res.status(500).json({ error: err.message || 'Failed to update category' });
    }
});

// DELETE /api/products/categories/:id (admin)
router.delete('/categories/:id', verifyToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: 'Invalid category id' });
        }

        await prisma.$transaction(async (tx) => {
            const category = await tx.category.findUnique({
                where: { id },
                select: { id: true, _count: { select: { product: true } } },
            });
            if (!category) {
                throw new Error('Category not found');
            }
            // Deleting a category that still has products would either violate the
            // product-category foreign key or (previously) silently spawn a fresh
            // "Uncategorized" category on every delete. Require the admin to move or
            // delete those products first, so a delete either removes the category
            // for good or fails with a clear reason.
            if (category._count.product > 0) {
                throw new Error(`Cannot delete: ${category._count.product} product(s) still use this category. Move or delete them first.`);
            }
            await tx.category.delete({ where: { id } });
        });
        res.json({ message: 'Category deleted' });
    } catch (err: any) {
        const message = err.message || 'Failed to delete category';
        const status = message === 'Category not found' ? 404 : message.startsWith('Cannot delete') ? 409 : 500;
        res.status(status).json({ error: message });
    }
});

// POST /api/products/bulk (admin)
router.post('/bulk', verifyToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { products, categoryId } = req.body;
        
        if (!Array.isArray(products)) {
            return res.status(400).json({ error: 'Products must be an array' });
        }

        const results = await Promise.all(products.map(async (p: any) => {
            const slug = p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            
            // If categoryId is provided in body, use it. Otherwise try to find category by slug if available in product data
            let targetCategoryId = categoryId;
            if (!targetCategoryId && p.categorySlug) {
                let cat = await prisma.category.findUnique({ where: { slug: p.categorySlug } });
                if (!cat) {
                    // Create category on-the-fly when processing bulk uploads so CSVs using new category names still import.
                    const name = String(p.categorySlug).split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
                    try {
                        cat = await prisma.category.create({ data: { name, slug: p.categorySlug } });
                    } catch (e) {
                        // Race or constraint error: try to find again
                        cat = await prisma.category.findUnique({ where: { slug: p.categorySlug } });
                    }
                }
                if (cat) targetCategoryId = cat.id;
            }

            if (!targetCategoryId) {
                throw new Error(`Category not found for product: ${p.name}`);
            }

            // Auto-generate SKU from Slug if empty
            const finalSku = p.sku && p.sku.trim() !== '' ? p.sku.trim() : slug.toUpperCase();

            // Fallback massage for Bulk string lists to JSON
            let formattedImages = p.images || null;
            if (formattedImages && typeof formattedImages === 'string' && !formattedImages.trim().startsWith('[')) {
                formattedImages = JSON.stringify(formattedImages.split(',').map((s: string) => s.trim()).filter(Boolean));
            }

            let formattedSpecs = p.specifications || null;
            if (formattedSpecs && typeof formattedSpecs === 'string' && !formattedSpecs.trim().startsWith('{')) {
                const obj: Record<string, string> = {};
                const rows = formattedSpecs.includes('\n') ? formattedSpecs.split('\n') : formattedSpecs.split(';');
                rows.forEach((line: string) => {
                    const parts = line.split(':');
                    if (parts.length >= 2) {
                        const key = parts[0].trim();
                        const value = parts.slice(1).join(':').trim();
                        if (key) obj[key] = value;
                    }
                });
                // Defensive fallback: If no colons were found, save it as a "Details" row instead of empty object
                if (Object.keys(obj).length === 0 && formattedSpecs.trim() !== '') {
                    obj['Details'] = formattedSpecs.trim();
                }
                formattedSpecs = JSON.stringify(obj);
            }

            return prisma.product.upsert({
                where: { slug },
                update: {
                    name: p.name,
                    sku: finalSku,
                    description: p.description,
                    price: Number(p.price),
                    categoryId: Number(targetCategoryId),
                    imageUrl: p.imageUrl,
                    images: formattedImages,
                    specifications: formattedSpecs,
                    rating: Number(p.rating) || 0,
                    reviewCount: Number(p.reviewCount) || 0,
                    stock: Number(p.stock) || 100,
                    active: p.active !== 'false' && p.active !== false,
                    featured: p.featured === 'true' || p.featured === true
                },
                create: {
                    name: p.name,
                    slug,
                    sku: finalSku,
                    description: p.description,
                    price: Number(p.price),
                    categoryId: Number(targetCategoryId),
                    imageUrl: p.imageUrl,
                    images: formattedImages,
                    specifications: formattedSpecs,
                    rating: Number(p.rating) || 0,
                    reviewCount: Number(p.reviewCount) || 0,
                    stock: Number(p.stock) || 100,
                    active: p.active !== 'false' && p.active !== false,
                    featured: p.featured === 'true' || p.featured === true
                }
            });
        }));

        res.json({ message: `Successfully processed ${results.length} products`, count: results.length });
    } catch (err: any) {
        res.status(500).json({ error: err.message || 'Failed to bulk-load products' });
    }
});

// GET /api/products/:id
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const product = await prisma.product.findFirst({
            where: { OR: [{ id: Number(req.params.id) || 0 }, { slug: String(req.params.id) }] },
            include: { category: true },
        });
        if (!product) { res.status(404).json({ error: 'Product not found' }); return; }
        res.json(product);
    } catch {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// POST /api/products (admin)
router.post('/', verifyToken, requireAdmin, uploadImage.single('image'), async (req: AuthRequest, res: Response) => {
    try {
        const { name, description, price, categoryId, rating, reviewCount, stock, active, featured, sku, images, specifications } = req.body;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const finalSku = sku && sku.trim() !== '' ? sku.trim() : slug.toUpperCase();
        const imageUrl = req.file ? `/uploads/images/${req.file.filename}` : req.body.imageUrl;
        const product = await prisma.product.create({
            data: {
                name, slug, sku: finalSku, description, price: Number(price), categoryId: Number(categoryId),
                imageUrl, images: images || null, specifications: specifications || null,
                rating: Number(rating) || 0, reviewCount: Number(reviewCount) || 0,
                stock: Number(stock) || 100, active: active !== 'false', featured: featured === 'true',
            },
            include: { category: true },
        });
        res.status(201).json(product);
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to create product';
        res.status(500).json({ error: msg });
    }
});

// PUT /api/products/:id (admin)
router.put('/:id', verifyToken, requireAdmin, uploadImage.single('image'), async (req: AuthRequest, res: Response) => {
    try {
        const { name, description, price, categoryId, rating, reviewCount, stock, active, featured, imageUrl: bodyImageUrl, sku, images, specifications } = req.body;
        const imageUrl = req.file ? `/uploads/images/${req.file.filename}` : bodyImageUrl;
        const updateData: Record<string, unknown> = {
            description, price: Number(price), categoryId: Number(categoryId),
            rating: Number(rating), reviewCount: Number(reviewCount),
            stock: Number(stock), active: active !== 'false', featured: featured === 'true',
        };
        if (sku !== undefined) updateData.sku = sku || null;
        if (images !== undefined) updateData.images = images || null;
        if (specifications !== undefined) updateData.specifications = specifications || null;
        
        if (name) {
            updateData.name = name;
            updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        }
        if (imageUrl) updateData.imageUrl = imageUrl;
        const product = await prisma.product.update({
            where: { id: Number(req.params.id) },
            data: updateData,
            include: { category: true },
        });
        res.json(product);
    } catch {
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// DELETE /api/products/:id (admin)
router.delete('/:id', verifyToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.product.update({ where: { id: Number(req.params.id) }, data: { active: false } });
        res.json({ message: 'Product deactivated' });
    } catch {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

export default router;
