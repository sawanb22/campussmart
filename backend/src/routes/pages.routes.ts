import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { verifyToken, requireAdmin, AuthRequest } from '../middleware/auth.middleware';
import { uploadDocument } from '../middleware/upload.middleware';

const router = Router();

const COLLEGE_SALE_SLUG = 'colleges-universities-for-sale';
const COLLEGE_SALE_DATA = {
    heroTitle: 'Businesses for Sale and Investment',
    heroSubtitle: 'Showing businesses for sale and investment. Buy or invest in a business listed by direct business owners and business brokers.',
    filterLabel: 'cbse schools',
    cards: [
        { title: 'School for Sale in Bahraich, India', description: 'CBSE school with 800+ students, day and boarding facility for sale in Bahraich. The school encompasses a total area of 87,000 square feet and includes approximately 40 rooms, fully equipped science and computer labs.', location: 'Bahraich', rating: '6.8', sales: 'INR 2.6 crore', margin: '40 %', askingPrice: 'INR 20 Cr', premium: true, image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=700&q=80' },
        { title: 'Playschool Seeking Loan in Haryana, India', description: 'Education society in Haryana with 5 CBSE schools and 70 playschools. This is an educational society with primary and play schools seeking growth funding.', location: 'Haryana', rating: '6.8', sales: 'INR 30 crore', margin: '25 %', askingPrice: 'INR 5 Cr at 15%', premium: true, image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=700&q=80' },
        { title: 'School for Sale in Thiruvananthapuram, India', description: 'CBSE-affiliated school with 400+ students and owned facilities. Located in Thiruvananthapuram, this school offers quality education from a well-established campus.', location: 'Thiruvananthapuram', rating: '6.2', sales: 'INR 1.6 crore', margin: '10 - 20 %', askingPrice: 'INR 8 Cr', image: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=700&q=80' },
    ],
};

async function ensureCollegeSalePage() {
    const existing = await prisma.page.findUnique({ where: { slug: COLLEGE_SALE_SLUG } });
    let hasCards = false;
    try {
        hasCards = Boolean(existing?.pageData && Array.isArray(JSON.parse(existing.pageData).cards) && JSON.parse(existing.pageData).cards.length > 0);
    } catch {
        hasCards = false;
    }
    return existing
        ? prisma.page.update({ where: { id: existing.id }, data: { template: COLLEGE_SALE_SLUG, published: true, ...(!hasCards ? { pageData: JSON.stringify(COLLEGE_SALE_DATA) } : {}) } })
        : prisma.page.create({ data: { title: 'Colleges / Universities for Sale', slug: COLLEGE_SALE_SLUG, template: COLLEGE_SALE_SLUG, published: true, pageData: JSON.stringify(COLLEGE_SALE_DATA) } });
}

const PARTNER_SLUG = 'partner-with-colleges';

// Makes sure the "Partner With Running Colleges" page (linked from the Classifieds
// "Partnership Opportunities" card) always has a DB row so it shows up in the admin
// Pages Manager. Its full default content lives in the React component / pageDefaults.ts
// and is used as a fallback for any field this row doesn't override.
async function ensurePartnerPage() {
    const existing = await prisma.page.findUnique({ where: { slug: PARTNER_SLUG } });
    if (existing) return existing;
    return prisma.page.create({
        data: {
            title: 'Partner With Running Colleges',
            slug: PARTNER_SLUG,
            template: PARTNER_SLUG,
            published: true,
            pageData: JSON.stringify({}),
        },
    });
}

// Makes sure a page with default (empty) content exists for the given slug/title
// so it shows up in the admin Pages Manager. Its full default content lives in the
// React component / pageDefaults.ts and is used as a fallback for any field this
// row doesn't override.
async function ensureSimplePage(slug: string, title: string) {
    const existing = await prisma.page.findUnique({ where: { slug } });
    if (existing) return existing;
    return prisma.page.create({
        data: { title, slug, template: slug, published: true, pageData: JSON.stringify({}) },
    });
}

// GET /api/pages - get all pages (admin only to see unpublished)
router.get('/', verifyToken, requireAdmin, async (_req: AuthRequest, res: Response) => {
    try {
        await ensureCollegeSalePage();
        await ensurePartnerPage();
        await ensureSimplePage('innovation-centers', 'Innovation Centers');
        await ensureSimplePage('science-tech-labs', 'Science & Tech Labs');
        await ensureSimplePage('campus-master-planning', 'Campus Master Planning');
        await ensureSimplePage('ar-vr-experiences', 'AR / VR Learning');
        await ensureSimplePage('campus-furniture-design', 'Campus Furniture Design');
        await ensureSimplePage('sports-infrastructure', 'Sports Infrastructure');
        const pages = await prisma.page.findMany({
            orderBy: { title: 'asc' }
        });
        console.log(`Admin ${_req.user?.id} fetched ${pages.length} pages`);
        res.json(pages);
    } catch (error) {
        console.error('Failed to fetch pages:', error);
        res.status(500).json({ error: 'Failed to fetch pages' });
    }
});

// GET /api/pages/published - get all published pages (public)
router.get('/published', async (req: Request, res: Response) => {
    try {
        const pages = await prisma.page.findMany({
            where: { published: true }
        });
        res.json(pages);
    } catch {
        res.status(500).json({ error: 'Failed to fetch pages' });
    }
});

// GET /api/pages/:idOrSlug - get specific page by ID (number) or slug (string)
router.get('/:idOrSlug', async (req: Request, res: Response) => {
    try {
        const param = req.params.idOrSlug as string;
        const numericId = parseInt(param);
        const isNumeric = !isNaN(numericId) && String(numericId) === param;

        if (!isNumeric && param === COLLEGE_SALE_SLUG) {
            return res.json(await ensureCollegeSalePage());
        }

        const page = isNumeric
            ? await prisma.page.findUnique({ where: { id: numericId } })
            : await prisma.page.findUnique({ where: { slug: param } });

        if (!page) {
            return res.status(404).json({ error: 'Page not found' });
        }
        res.json(page);
    } catch {
        res.status(500).json({ error: 'Failed to fetch page' });
    }
});

// POST /api/pages/upload-document - upload a PDF (e.g. NDA, Mandate) and get back its URL (admin)
router.post('/upload-document', verifyToken, requireAdmin, uploadDocument.single('file'), (req: AuthRequest, res: Response) => {
    if (!req.file) {
        res.status(400).json({ error: 'A PDF file is required' });
        return;
    }
    res.status(201).json({ url: `/uploads/documents/${req.file.filename}` });
});

// POST /api/pages - create a page
router.post('/', verifyToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        // Validate required fields
        if (!req.body.title || !req.body.slug) {
            res.status(400).json({ error: 'Title and slug are required' });
            return;
        }

        const page = await prisma.page.create({
            data: {
                ...req.body,
                published: req.body.published !== undefined ? req.body.published : true
            }
        });
        console.log(`Page created by admin ${req.user?.id}: ${page.slug}`);
        res.status(201).json(page);
    } catch (error) {
        console.error('Failed to create page:', error);
        res.status(500).json({ error: 'Failed to create page' });
    }
});

// PUT /api/pages/:id - update a page
router.put('/:id', verifyToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        
        // Validate ID
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid page ID' });
            return;
        }

        // Check page exists before attempting update
        const existing = await prisma.page.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ error: 'Page not found' });
            return;
        }

        // Update page
        const page = await prisma.page.update({
            where: { id },
            data: {
                ...req.body,
                updatedAt: new Date() // Ensure updatedAt is set
            }
        });
        
        console.log(`Page ${id} updated by admin ${req.user?.id}`);
        res.json(page);
    } catch (error) {
        console.error(`Failed to update page ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to update page' });
    }
});

// DELETE /api/pages/:id - delete a page
router.delete('/:id', verifyToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        
        // Validate ID
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid page ID' });
            return;
        }

        // Check page exists before attempting delete
        const existing = await prisma.page.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ error: 'Page not found' });
            return;
        }

        await prisma.page.delete({
            where: { id }
        });
        console.log(`Page ${id} deleted by admin ${req.user?.id}`);
        res.status(204).end();
    } catch (error) {
        console.error(`Failed to delete page ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to delete page' });
    }
});

export default router;
