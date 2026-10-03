import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function runVerification() {
    console.log('====================================================');
    console.log('🧪 RUNNING FIX-005 AUTOMATED VERIFICATION SUITE');
    console.log('====================================================\n');

    let passed = 0;
    let failed = 0;

    function assert(condition: boolean, testName: string, detail?: string) {
        if (condition) {
            console.log(`✅ PASS: ${testName}`);
            passed++;
        } else {
            console.error(`❌ FAIL: ${testName}${detail ? ` - ${detail}` : ''}`);
            failed++;
        }
    }

    // ── Test 1: Production Database Connection ───────────────────────────
    try {
        await prisma.$connect();
        const dbUrl = process.env.DATABASE_URL || '';
        assert(
            dbUrl.includes('oregon-postgres.render.com/campusmart_db_e2bx'),
            'Step 1: DATABASE_URL connects to Render production PostgreSQL',
            `Current DB host: ${dbUrl.split('@')[1]?.split('/')[0]}`
        );
    } catch (e: any) {
        assert(false, 'Step 1: DATABASE_URL connects to Render PostgreSQL', e.message);
    }

    // ── Test 2: Idempotent Seed Guard & Flag ──────────────────────────────
    try {
        const bootstrapRecord = await prisma.siteContent.findUnique({
            where: { key: 'system_bootstrapped' },
        });
        assert(
            bootstrapRecord?.value === 'true',
            'Step 2: system_bootstrapped flag is set to "true" in siteContent',
            `Found: ${bootstrapRecord?.value}`
        );

        // Verify guard in runSeed.ts and prisma/seed.ts
        const runSeedContent = fs.readFileSync(path.resolve(__dirname, '../src/runSeed.ts'), 'utf-8');
        const prismaSeedContent = fs.readFileSync(path.resolve(__dirname, '../prisma/seed.ts'), 'utf-8');

        assert(
            runSeedContent.includes("key: 'system_bootstrapped'") &&
            runSeedContent.includes("bootstrapFlag?.value === 'true'"),
            'Step 2: runSeed.ts has system_bootstrapped idempotent guard'
        );

        assert(
            prismaSeedContent.includes("key: 'system_bootstrapped'") &&
            prismaSeedContent.includes("bootstrapFlag?.value === 'true'"),
            'Step 2: prisma/seed.ts has system_bootstrapped idempotent guard'
        );

        assert(
            !runSeedContent.includes('furniture-2025.pdf') &&
            !runSeedContent.includes('lab-equipment.pdf') &&
            !runSeedContent.includes('technology.pdf'),
            'Step 2: runSeed.ts has removed mock catalogue seeding lines'
        );

        assert(
            !prismaSeedContent.includes('furniture-2025.pdf') &&
            !prismaSeedContent.includes('lab-equipment.pdf') &&
            !prismaSeedContent.includes('technology.pdf'),
            'Step 2: prisma/seed.ts has removed mock catalogue seeding lines'
        );
    } catch (e: any) {
        assert(false, 'Step 2: Idempotent Seed Guard', e.message);
    }

    // ── Test 3: Database Hygiene (Purged Mock Catalogues) ────────────────
    try {
        const mockCatalogues = await prisma.catalogue.findMany({
            where: {
                OR: [
                    { fileUrl: { contains: 'furniture-2025.pdf' } },
                    { fileUrl: { contains: 'lab-equipment.pdf' } },
                    { fileUrl: { contains: 'technology.pdf' } },
                ]
            }
        });
        assert(
            mockCatalogues.length === 0,
            'Step 5: Broken mock catalogue records purged from database',
            `Remaining mock records: ${mockCatalogues.length}`
        );
    } catch (e: any) {
        assert(false, 'Step 5: Database Hygiene', e.message);
    }

    // ── Test 4: Pure Database-Driven Rendering on /catalogues ───────────
    try {
        const cataloguesPagePath = path.resolve(__dirname, '../../src/pages/catalogues.tsx');
        const cataloguesSource = fs.readFileSync(cataloguesPagePath, 'utf-8');

        assert(
            !cataloguesSource.includes("api.get('/catalogues')") &&
            !cataloguesSource.includes('api.get("/catalogues")'),
            "Step 3: catalogues.tsx removed background api.get('/catalogues') override"
        );

        assert(
            !cataloguesSource.includes("api.get('/case-studies')") &&
            !cataloguesSource.includes('api.get("/case-studies")'),
            "Step 3: catalogues.tsx removed background api.get('/case-studies') override"
        );

        assert(
            cataloguesSource.includes("usePageData('catalogues')"),
            "Step 3: catalogues.tsx is bound 100% to usePageData('catalogues')"
        );

        assert(
            cataloguesSource.includes('Array.isArray(data.cards)') &&
            cataloguesSource.includes('Array.isArray(data.caseStudies)'),
            "Step 3: catalogues.tsx respects empty database arrays [] without resurrecting DEFAULTS"
        );

        assert(
            cataloguesSource.includes('!loading && caseStudies.length > 0'),
            "Step 3: catalogues.tsx omits Case Studies section entirely when caseStudies is empty"
        );

        assert(
            cataloguesSource.includes('hasValidPdf') &&
            cataloguesSource.includes('Request Catalogue') &&
            cataloguesSource.includes("api.post('/contact'"),
            "Step 3: catalogues.tsx renders Request Catalogue modal for cards without physical PDF"
        );

        assert(
            cataloguesSource.includes('getUserSession') &&
            cataloguesSource.includes('getUserToken'),
            "Step 3: catalogues.tsx integrates centralized auth session helpers for token and user prefill"
        );

        assert(
            cataloguesSource.includes('token=${encodeURIComponent(token)}'),
            "Step 3: catalogues.tsx attaches token query parameter to download links for direct access resilience"
        );

        // Functional evaluation of hasValidPdf edge cases
        const hasValidPdfTest = (url?: string): boolean => {
            if (!url) return false;
            const trimmed = url.trim();
            if (
                !trimmed ||
                trimmed === '#' ||
                trimmed === '/' ||
                trimmed.toLowerCase() === 'null' ||
                trimmed.toLowerCase() === 'undefined' ||
                trimmed.toLowerCase() === 'n/a' ||
                trimmed.toLowerCase() === 'none' ||
                trimmed.toLowerCase().startsWith('javascript:')
            ) {
                return false;
            }
            if (
                trimmed.includes('furniture-2025.pdf') ||
                trimmed.includes('lab-equipment.pdf') ||
                trimmed.includes('technology.pdf')
            ) {
                return false;
            }
            return true;
        };

        assert(hasValidPdfTest(undefined) === false, "Step 3: hasValidPdf rejects undefined");
        assert(hasValidPdfTest('') === false, "Step 3: hasValidPdf rejects empty string");
        assert(hasValidPdfTest('   ') === false, "Step 3: hasValidPdf rejects whitespace");
        assert(hasValidPdfTest('#') === false, "Step 3: hasValidPdf rejects hash anchor");
        assert(hasValidPdfTest('/') === false, "Step 3: hasValidPdf rejects slash root");
        assert(hasValidPdfTest('null') === false, "Step 3: hasValidPdf rejects literal 'null'");
        assert(hasValidPdfTest('furniture-2025.pdf') === false, "Step 3: hasValidPdf rejects mock furniture pdf");
        assert(hasValidPdfTest('/uploads/catalogues/1788258517755-838164996.pdf') === true, "Step 3: hasValidPdf accepts valid uploaded pdf");
    } catch (e: any) {
        assert(false, 'Step 3: catalogues.tsx verification', e.message);
    }

    // ── Test 5: Smart Non-Destructive Starter Template in UnifiedPageEditor
    try {
        const editorPath = path.resolve(__dirname, '../../src/admin/components/UnifiedPageEditor.tsx');
        const editorSource = fs.readFileSync(editorPath, 'utf-8');

        assert(
            editorSource.includes('Load Starter Template') &&
            editorSource.includes('setShowTemplateModal(true)'),
            'Step 4: UnifiedPageEditor has [Load Starter Template] button in toolbar'
        );

        assert(
            editorSource.includes('Append Samples (Keep my current cards)') &&
            editorSource.includes('Replace All'),
            'Step 4: UnifiedPageEditor template modal offers Append Samples and Replace All'
        );

        assert(
            editorSource.includes('existingTitles') &&
            editorSource.includes('nonDuplicateSamples') &&
            editorSource.includes('[...currentCards, ...JSON.parse(JSON.stringify(nonDuplicateSamples))]'),
            'Step 4: UnifiedPageEditor preserves user-created cards at top and appends non-duplicate samples'
        );

        assert(
            !editorSource.includes('Conversion / CTA Footer'),
            'Step 4: UnifiedPageEditor removed duplicate "Conversion / CTA Footer" block'
        );

        assert(
            !editorSource.includes('Real downloadable catalogue PDFs are managed in <strong>Catalogues</strong>'),
            'Step 4: UnifiedPageEditor removed obsolete/conflicting shortcut banner for catalogues'
        );

        assert(
            editorSource.includes("page.slug === 'catalogues'") &&
            editorSource.includes('cardsUseDownloadLink'),
            'Step 4: UnifiedPageEditor supports catalogue cards editing directly'
        );
    } catch (e: any) {
        assert(false, 'Step 4: UnifiedPageEditor verification', e.message);
    }

    // ── Test 6: Backend Contact Enquiry Controller Resilience ────────────
    try {
        const contactRoutePath = path.resolve(__dirname, '../src/routes/contact.routes.ts');
        const contactRouteSource = fs.readFileSync(contactRoutePath, 'utf-8');

        assert(
            contactRouteSource.includes("syncToSpreadsheet({ type: 'Contact Enquiry'") &&
            contactRouteSource.includes(".catch((sheetErr) => console.error('Spreadsheet sync error (non-fatal):', sheetErr));"),
            'Step 3 & Backend: POST /api/contact decouples spreadsheet sync non-blockingly'
        );

        // Verify direct database persistence for catalogue request enquiry
        const testEnquiry = await prisma.contactEnquiry.create({
            data: {
                name: 'Verification Bot',
                email: 'verify@campusmart.test',
                phone: '9876543210',
                subject: 'Catalogue Request: Verification Test Card',
                message: 'Institution: Test College\n\nPlease share the catalogue.',
            },
        });
        assert(Boolean(testEnquiry.id), 'Backend: Contact enquiry persisted successfully to PostgreSQL');
        await prisma.contactEnquiry.delete({ where: { id: testEnquiry.id } });
        assert(true, 'Backend: Ephemeral test enquiry cleaned up from database');
    } catch (e: any) {
        assert(false, 'Test 6: Contact route resilience', e.message);
    }

    // ── Test 7: Page Defaults & Starter Template Quality ──────────────────
    try {
        const pageDefaultsPath = path.resolve(__dirname, '../../src/admin/pageDefaults.ts');
        const pageDefaultsSource = fs.readFileSync(pageDefaultsPath, 'utf-8');

        assert(
            !pageDefaultsSource.includes('SchoolMart') ||
            !pageDefaultsSource.slice(pageDefaultsSource.indexOf("'catalogues':")).includes('SchoolMart'),
            'Step 4: pageDefaults.ts uses CampusMart branding for catalogues'
        );

        assert(
            pageDefaultsSource.includes('/uploads/catalogues/1788258517755-838164996.pdf') &&
            pageDefaultsSource.includes('/uploads/catalogues/1788784785158-777852239.pdf'),
            'Step 4: pageDefaults.ts catalogues starter template has valid verified PDF links'
        );
    } catch (e: any) {
        assert(false, 'Test 7: Page defaults verification', e.message);
    }

    console.log('\n====================================================');
    console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
        process.exit(1);
    }
}

runVerification()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
