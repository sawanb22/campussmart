import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PAGES = [
    { slug: 'ar-vr-learning', title: 'AR / VR Learning', template: 'home-feature-detail' },
    { slug: 'ai-digital-design-supply', title: 'AI Digital Design Supply', template: 'ai-digital-design-supply' },
    { slug: 'ai-guide', title: 'AI Implementation Guide', template: 'ai-guide' },
    { slug: 'ai-stations', title: 'AI Learning Stations', template: 'ai-stations' },
    { slug: 'assessment-system', title: 'Assessment Systems', template: 'assessment-system' },
    { slug: 'campus-automation', title: 'Campus Automation', template: 'campus-automation' },
    { slug: 'campus-design-execution', title: 'Campus Design Execution', template: 'campus-design-execution' },
    { slug: 'collaboration', title: 'Collaboration Spaces', template: 'collaboration' },
    { slug: 'digital-transformation', title: 'Digital Transformation', template: 'digital-transformation' },
    { slug: 'furniture-design-supply', title: 'Furniture Design Supply', template: 'furniture-design-supply' },
    { slug: 'innovation-centres', title: 'Innovation Centres', template: 'innovation-centres' },
    { slug: 'libraries', title: 'Libraries', template: 'libraries' },
    { slug: 'library-management', title: 'Library Management', template: 'library-management' },
    { slug: 'lms', title: 'Learning Management Systems', template: 'lms' },
    { slug: 'lookbook', title: 'Play Furniture Lookbook', template: 'lookbook' },
    { slug: 'new-environments', title: 'New Learning Environments', template: 'new-environments' },
    { slug: 'partnership', title: 'Partner Campuses', template: 'partnership' },
    { slug: 'product-catalog', title: 'Product Catalog 2025', template: 'product-catalog' },
    { slug: 'setup-college', title: 'Setting Up a College in India', template: 'setup-college' },
    { slug: 'smart-classrooms', title: 'Smart Classrooms', template: 'home-feature-detail' },
    { slug: 'sports-design-execution', title: 'Sports Design & Execution', template: 'sports-design-execution' },
    { slug: 'sports-infra', title: 'Sports Infrastructure', template: 'sports-infra' },
    { slug: 'tech-infra', title: 'Technology Infrastructure', template: 'tech-infra' },
    { slug: 'ugc-guidelines', title: 'UGC Guidelines', template: 'ugc-guidelines' },
    // These 5 already use the hook, but let's make sure they are in the DB:
    { slug: 'labs', title: 'Laboratory Solutions', template: 'labs' },
    { slug: 'lab-products', title: 'Lab Products', template: 'lab-products' },
    { slug: 'library-products', title: 'Library Products', template: 'library-products' },
    { slug: 'sports-products', title: 'Sports Products', template: 'sports-products' },
    { slug: 'innovation', title: 'Innovation Centers', template: 'innovation' },
    { slug: 'furniture', title: 'Campus Furniture', template: 'furniture' },
    { slug: 'campus-design', title: 'Campus Master Planning', template: 'campus-design' },
    { slug: 'ai-ml', title: 'AI & Machine Learning', template: 'ai-ml' }
];

async function main() {
    console.log('Starting to seed static pages...');

    for (const p of PAGES) {
        const existing = await prisma.page.findUnique({
            where: { slug: p.slug }
        });

        if (!existing) {
            await prisma.page.create({
                data: {
                    title: p.title,
                    slug: p.slug,
                    template: p.template,
                    published: true,
                    pageData: null,
                }
            });
            console.log(`Created page: ${p.slug}`);
        } else {
            console.log(`Skipped page (already exists): ${p.slug}`);
        }
    }

    console.log('Finished seeding pages!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
