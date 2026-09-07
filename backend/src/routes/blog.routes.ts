import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { verifyToken, requireAdmin, AuthRequest } from '../middleware/auth.middleware';
import { uploadImage } from '../middleware/upload.middleware';

const router = Router();


// GET /api/blog/seed-data (Temporary endpoint to seed dummy content)
router.get('/seed-data', async (req: Request, res: Response) => {
    if (req.query.secret !== 'admin123') return res.status(403).json({ error: 'Unauthorized' });
    try {
        const categoriesData = [
            { name: 'Campus Design', slug: 'campus-design' },
            { name: 'Technology', slug: 'technology' },
            { name: 'Pedagogy', slug: 'pedagogy' },
            { name: 'Infrastructure', slug: 'infrastructure' },
        ];
        
        let createdCats: any[] = [];
        for (const cat of categoriesData) {
            const existing = await prisma.blogCategory.findUnique({ where: { slug: cat.slug } });
            if (!existing) createdCats.push(await prisma.blogCategory.create({ data: cat }));
            else createdCats.push(existing);
        }

        const getCatId = (slug: string) => createdCats.find(c => c.slug === slug)?.id;

        const blogPostsData = [
            {
                title: 'Data-Driven Campus Security',
                slug: 'data-driven-campus-security-' + Date.now().toString(),
                excerpt: 'Moving from reactive security cameras to proactive, AI-driven digital sentinels.',
                body: '<p>The modern campus requires more than just passive recording. By using AI over existing CCTV infrastructure, schools can instantly detect anomalies, perimeter breaches, and unusual crowding without constant human monitoring. This shift from reactive to proactive security is the core of our tech-driven campus promise.</p>',
                imageUrl: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&w=800&q=80',
                published: true,
                categoryId: getCatId('technology'),
            },
            {
                title: 'The Role of Technology in Special Education',
                slug: 'technology-special-education-' + Date.now().toString(),
                excerpt: 'Leveraging accessible hardware and adaptive software for inclusive learning environments.',
                body: '<p>Every student deserves an equal opportunity to learn. Modern classroom technology, including adaptive keyboards, text-to-speech AI modules, and custom sensory furniture, bridges the gap. By equipping resource rooms with state-of-the-art tools, educational institutions can foster truly inclusive ecosystems.</p>',
                imageUrl: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80',
                published: true,
                categoryId: getCatId('pedagogy'),
            },
            {
                title: 'Integrating Active Acoustics in Lecture Halls',
                slug: 'active-acoustics-lecture-halls-' + Date.now().toString(),
                excerpt: 'How programmable sound deflectors are eliminating dead zones in campus auditoriums.',
                body: '<p>Sound design is arguably the most critical yet overlooked aspect of a lecture hall. Integrating active acoustics allows the room to adjust its sound profile dynamically depending on whether a single lecturer is speaking or a panel is presenting. This guide explores the architectural implications of smart sound design.</p>',
                imageUrl: 'https://images.unsplash.com/photo-1517520286311-6385afda1076?auto=format&fit=crop&w=800&q=80',
                published: true,
                categoryId: getCatId('campus-design'),
            },
            {
                title: 'Designing Collaborative Labs for Gen Z',
                slug: 'collaborative-labs-gen-z-' + Date.now().toString(),
                excerpt: 'Move beyond traditional front-facing rows to foster dynamic, peer-to-peer STEM education.',
                body: '<p>The lab of the future isn\'t a rigid matrix of identical stations. It is a fluid, reconfigurable space where groups can cluster naturally. We look at the latest modular lab benches, safely integrated localized exhaust systems, and high-visibility glass partition integrations that empower project-based learning.</p>',
                imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
                published: true,
                categoryId: getCatId('infrastructure'),
            },
            {
                title: 'Building Eco-Friendly Auditoriums',
                slug: 'building-eco-friendly-audits-' + Date.now().toString(),
                excerpt: 'Sustainable materials meeting premier acoustics.',
                body: '<p>Constructing a massive auditorium usually leaves a huge carbon footprint. By sourcing local timber, recycled acoustic paneling, and deploying low-energy LED spot-rigs, modern schools can reduce structural waste while maintaining incredible presence.</p>',
                imageUrl: 'https://images.unsplash.com/photo-1598016422731-50e561a069a5?auto=format&fit=crop&w=800&q=80',
                published: true,
                categoryId: getCatId('campus-design'),
            }
        ];

        for (const post of blogPostsData) {
            await prisma.blogPost.create({ data: post });
        }

        res.json({ success: true, message: 'Successfully seeded 5 premium blog posts and 4 categories.' });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// GET /api/blog/categories
router.get('/categories', async (_req: Request, res: Response) => {
    try {
        const categories = await prisma.blogCategory.findMany({ orderBy: { name: 'asc' } });
        res.json(categories);
    } catch {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// POST /api/blog/categories (admin)
router.post('/categories', verifyToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { name } = req.body;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const category = await prisma.blogCategory.create({ data: { name, slug } });
        res.status(201).json(category);
    } catch {
        res.status(500).json({ error: 'Failed to create category' });
    }
});

// PUT /api/blog/categories/:id (admin)
router.put('/categories/:id', verifyToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { name } = req.body;
        if (!name || !String(name).trim()) { res.status(400).json({ error: 'Category name is required' }); return; }
        const slug = String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const category = await prisma.blogCategory.update({ where: { id: Number(req.params.id) }, data: { name, slug } });
        res.json(category);
    } catch {
        res.status(500).json({ error: 'Failed to update category' });
    }
});

// DELETE /api/blog/categories/:id (admin)
router.delete('/categories/:id', verifyToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.blogCategory.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: 'Category deleted' });
    } catch {
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

// GET /api/blog
router.get('/', async (req: Request, res: Response) => {
    try {
        const { page = '1', limit = '10', all, category } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where: any = all === 'true' ? {} : { published: true };

        if (category) {
            where.blogcategory = { slug: String(category) };
        }

        const [posts, total] = await Promise.all([
            prisma.blogPost.findMany({ where, skip, take: Number(limit), orderBy: { publishedAt: 'desc' }, include: { blogcategory: true } }),
            prisma.blogPost.count({ where }),
        ]);
        res.json({ posts, total, page: Number(page), limit: Number(limit) });
    } catch {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// GET /api/blog/:slug
router.get('/:slug', async (req: Request, res: Response) => {
    try {
        const post = await prisma.blogPost.findFirst({
            where: { OR: [{ slug: String(req.params.slug) }, { id: Number(req.params.slug) || 0 }] },
            include: { blogcategory: true }
        });
        if (!post) { res.status(404).json({ error: 'Post not found' }); return; }
        res.json(post);
    } catch {
        res.status(500).json({ error: 'Failed to fetch post' });
    }
});

// POST /api/blog (admin)
router.post('/', verifyToken, requireAdmin, uploadImage.single('image'), async (req: AuthRequest, res: Response) => {
    try {
        const { title, excerpt, body, published, categoryId } = req.body;
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();
        const imageUrl = req.file ? `/uploads/images/${req.file.filename}` : req.body.imageUrl;
        const isPublished = published === 'true' || published === true;
        const post = await prisma.blogPost.create({
            data: {
                title, slug, excerpt, body, imageUrl,
                published: isPublished, publishedAt: isPublished ? new Date() : null,
                authorId: req.user!.id,
                ...(categoryId && categoryId !== 'null' ? { categoryId: Number(categoryId) } : {})
            },
            include: { blogcategory: true }
        });
        res.status(201).json(post);
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to create post';
        res.status(500).json({ error: msg });
    }
});

// PUT /api/blog/:id (admin)
router.put('/:id', verifyToken, requireAdmin, uploadImage.single('image'), async (req: AuthRequest, res: Response) => {
    try {
        const { title, excerpt, body, published, imageUrl: bodyImageUrl, categoryId } = req.body;
        const imageUrl = req.file ? `/uploads/images/${req.file.filename}` : bodyImageUrl;
        const isPublished = published === 'true' || published === true;
        const updateData: any = {
            excerpt, body, published: isPublished,
            publishedAt: isPublished ? new Date() : null,
        };
        if (title) {
            updateData.title = title;
            updateData.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();
        }
        if (imageUrl) updateData.imageUrl = imageUrl;
        if (categoryId !== undefined) {
            updateData.categoryId = categoryId && categoryId !== 'null' ? Number(categoryId) : null;
        }

        const post = await prisma.blogPost.update({
            where: { id: Number(req.params.id) },
            data: updateData,
            include: { blogcategory: true }
        });
        res.json(post);
    } catch {
        res.status(500).json({ error: 'Failed to update post' });
    }
});

// DELETE /api/blog/:id (admin)
router.delete('/:id', verifyToken, requireAdmin, async (_req: AuthRequest, res: Response) => {
    try {
        await prisma.blogPost.delete({ where: { id: Number(_req.params.id) } });
        res.json({ message: 'Post deleted' });
    } catch {
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

export default router;
