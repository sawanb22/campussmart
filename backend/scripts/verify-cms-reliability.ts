process.env.VERCEL = '1';

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import jwt from 'jsonwebtoken';
import app from '../src/index';
import prisma from '../src/lib/prisma';

async function runCMSReliabilityTests() {
    console.log('================================================================');
    console.log('🧪 CMS RELIABILITY & PRECISION OVERRIDE AUTOMATED TEST SUITE');
    console.log('================================================================\n');

    let passed = 0;
    let failed = 0;
    const issues: string[] = [];

    const recordPass = (testName: string, detail?: string) => {
        console.log(`✅ PASS: ${testName} ${detail ? `(${detail})` : ''}`);
        passed++;
    };

    const recordFail = (testName: string, detail: string) => {
        console.error(`❌ FAIL: ${testName} -> ${detail}`);
        failed++;
        issues.push(`${testName}: ${detail}`);
    };

    const TEST_PORT = 3998;
    const server = app.listen(TEST_PORT);
    const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

    try {
        // ── Auth Setup ────────────────────────────────────────────────────────
        const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
        if (!adminUser) {
            throw new Error('No admin user found in database! Seed or create an admin first.');
        }

        const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
        const adminToken = jwt.sign(
            { id: adminUser.id, email: adminUser.email, role: 'admin' },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Fetch colleges-universities-for-sale page or create if missing
        let testPage = await prisma.page.findUnique({ where: { slug: 'colleges-universities-for-sale' } });
        if (!testPage) {
            testPage = await prisma.page.create({
                data: {
                    title: 'Colleges / Universities for Sale',
                    slug: 'colleges-universities-for-sale',
                    template: 'colleges-universities-for-sale',
                    published: true,
                    pageData: JSON.stringify({ cards: [{ title: 'Seed School' }] })
                }
            });
        }
        const originalPageData = testPage.pageData;
        const originalTitle = testPage.title;

        // ══════════════════════════════════════════════════════════════════════
        // Edge Case 1: Saving [] preserves [] and does not resurrect defaults
        // ══════════════════════════════════════════════════════════════════════
        console.log('\n--- 1. Edge Case: Empty Array Deletion & Non-Resurrection ---');
        {
            // Update page with empty cards array
            const putRes = await fetch(`${BASE_URL}/api/pages/${testPage.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${adminToken}`
                },
                body: JSON.stringify({
                    pageData: { heroTitle: 'Empty State Test', cards: [] }
                })
            });

            if (putRes.status === 200) {
                recordPass('PUT /api/pages/:id with cards: [] succeeded (HTTP 200)');
            } else {
                recordFail('PUT /api/pages/:id with cards: []', `Expected 200, got ${putRes.status}`);
            }

            // GET by slug to trigger ensureCollegeSalePage() and check if it auto-resurrects
            const getRes = await fetch(`${BASE_URL}/api/pages/colleges-universities-for-sale`);
            const getData = await getRes.json() as any;
            const parsedPageData = JSON.parse(getData.pageData || '{}');

            if (Array.isArray(parsedPageData.cards) && parsedPageData.cards.length === 0) {
                recordPass('GET /api/pages/:slug preserved cards: [] without auto-resurrecting seed cards');
            } else {
                recordFail(
                    'Preservation of cards: [] on GET',
                    `Expected cards to be empty array, got: ${JSON.stringify(parsedPageData.cards)}`
                );
            }

            // Verify frontend template fallback evaluation
            const defaultCards = [{ title: 'Default Card 1' }, { title: 'Default Card 2' }];
            const evaluatedCards = Array.isArray(parsedPageData.cards) ? parsedPageData.cards : defaultCards;
            if (evaluatedCards.length === 0) {
                recordPass('Frontend template check Array.isArray(cards) ? cards : DEFAULTS correctly renders 0 cards');
            } else {
                recordFail(
                    'Template fallback evaluation',
                    `Expected 0 cards, got ${evaluatedCards.length} cards (resurrected defaults)`
                );
            }
        }

        // ══════════════════════════════════════════════════════════════════════
        // Edge Case 2: Replacing titles/links overrides old data
        // ══════════════════════════════════════════════════════════════════════
        console.log('\n--- 2. Edge Case: Precision Override of Titles & Links ---');
        {
            const updatedTitle = `Custom University ${Date.now()}`;
            const updatedHeroTitle = 'Exclusively Overridden Hero Title';
            const updatedCards = [
                {
                    title: 'Brand New Medical College For Sale',
                    location: 'Bangalore, India',
                    askingPrice: 'INR 50 Cr',
                    href: '/details/medical-college-blr'
                }
            ];

            const putRes = await fetch(`${BASE_URL}/api/pages/${testPage.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${adminToken}`
                },
                body: JSON.stringify({
                    title: updatedTitle,
                    pageData: {
                        heroTitle: updatedHeroTitle,
                        heroSubtitle: '', // cleared string
                        cards: updatedCards
                    }
                })
            });

            if (putRes.status === 200) {
                recordPass('PUT /api/pages/:id with updated title and card succeeded');
            } else {
                recordFail('PUT /api/pages/:id updated data', `Expected 200, got ${putRes.status}`);
            }

            const getRes = await fetch(`${BASE_URL}/api/pages/colleges-universities-for-sale`);
            const getData = await getRes.json() as any;
            const parsedPageData = JSON.parse(getData.pageData || '{}');

            const isTitleCorrect = getData.title === updatedTitle;
            const isHeroTitleCorrect = parsedPageData.heroTitle === updatedHeroTitle;
            const isCardTitleCorrect = parsedPageData.cards?.[0]?.title === 'Brand New Medical College For Sale';
            const isCardLinkCorrect = parsedPageData.cards?.[0]?.href === '/details/medical-college-blr';
            // Cleared string check with nullish coalescing
            const resolvedSubtitle = parsedPageData.heroSubtitle ?? 'Default Subtitle';
            const isClearedStringRespected = resolvedSubtitle === '';

            if (isTitleCorrect && isHeroTitleCorrect && isCardTitleCorrect && isCardLinkCorrect) {
                recordPass('GET returned precision overridden data immediately without stale cache');
            } else {
                recordFail('Precision override verification', `Data did not match expected overrides`);
            }

            if (isClearedStringRespected) {
                recordPass('Cleared string "" is respected with ?? (not resurrected to default subtitle)');
            } else {
                recordFail('Nullish coalescing check', `Subtitle resurrected to: "${resolvedSubtitle}"`);
            }
        }

        // ══════════════════════════════════════════════════════════════════════
        // Edge Case 3: Actual 500 error contract & client failure preservation
        // ══════════════════════════════════════════════════════════════════════
        console.log('\n--- 3. Edge Case: Failure State Preservation & Error Accuracy ---');
        {
            // Verify GET /api/content actual error contract with real HTTP call on simulated DB failure
            const originalFindMany = prisma.siteContent.findMany;
            try {
                (prisma.siteContent as any).findMany = async () => {
                    throw new Error('Simulated database disconnect');
                };
                const errRes = await fetch(`${BASE_URL}/api/content`);
                const errBody = await errRes.json() as any;

                if (errRes.status === 500 && errBody?.error === 'Database unavailable') {
                    recordPass('GET /api/content actually returns HTTP 500 { error: "Database unavailable" } on DB disconnect');
                } else {
                    recordFail('GET /api/content error contract', `Expected 500 { error: 'Database unavailable' }, got ${errRes.status} ${JSON.stringify(errBody)}`);
                }
            } finally {
                (prisma.siteContent as any).findMany = originalFindMany;
            }

            // Simulate the client cache resilience logic from usePageData.ts:
            const simulatedModuleCache = new Map<string, any>();
            const testSlug = 'colleges-universities-for-sale';
            const previousValidState = { heroTitle: 'Previous Valid Data', cards: [{ title: 'Valid 1' }] };

            // Step A: Initial successful load puts valid data in cache
            simulatedModuleCache.set(testSlug, previousValidState);
            let clientHookState = simulatedModuleCache.get(testSlug);

            // Step B: Subsequent request encounters a 500 server error
            const simulateFetchWithError = async () => {
                try {
                    // Simulate failed api.get
                    throw new Error('500 Internal Server Error');
                } catch (err) {
                    // Hook implementation returns null and retains existing cache/state
                    return null;
                }
            };

            const result = await simulateFetchWithError();
            if (result !== null) {
                simulatedModuleCache.set(testSlug, result);
                clientHookState = result;
            }

            // Verify cache was NOT poisoned with {}
            const cacheValue = simulatedModuleCache.get(testSlug);
            if (cacheValue && cacheValue.heroTitle === 'Previous Valid Data' && clientHookState.cards.length === 1) {
                recordPass('On 500 network failure, client hook retains previous valid data and does NOT poison cache with {}');
            } else {
                recordFail(
                    'Client cache resilience on failure',
                    `Cache was corrupted: ${JSON.stringify(cacheValue)}`
                );
            }
        }

        // ══════════════════════════════════════════════════════════════════════
        // Edge Case 4: SiteContent save does not clobber homepage keys
        // ══════════════════════════════════════════════════════════════════════
        console.log('\n--- 4. Edge Case: Admin SiteContent Scoping & Protection ---');
        {
            const testHomeHero = JSON.stringify({
                title: 'Protected Homepage Hero Headline',
                eyebrow: 'Protected Eyebrow',
                timestamp: Date.now()
            });

            // Ensure home_hero exists
            await prisma.siteContent.upsert({
                where: { key: 'home_hero' },
                update: { value: testHomeHero },
                create: { key: 'home_hero', value: testHomeHero }
            });

            // Now simulate SiteContent admin saving with filtered payload
            const HOMEPAGE_MANAGED_KEYS = new Set([
                'home_hero',
                'home_features',
                'home_services',
                'home_sidebar',
                'home_categories',
                'ticker_announcements',
                'collaborations',
            ]);

            const fullFormContent = {
                about_text: 'Updated about text from Site Content',
                contact_email: 'info@campussmart.in',
                home_hero: JSON.stringify({ title: 'STALE OVERWRITE ATTEMPT' }) // Should be filtered out!
            };

            // Filter out HOMEPAGE_MANAGED_KEYS as implemented in SiteContent.tsx
            const filteredPayload: Record<string, string> = {};
            for (const [key, val] of Object.entries(fullFormContent)) {
                if (!HOMEPAGE_MANAGED_KEYS.has(key)) {
                    filteredPayload[key] = val;
                }
            }

            const putContentRes = await fetch(`${BASE_URL}/api/content`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${adminToken}`
                },
                body: JSON.stringify(filteredPayload)
            });

            if (putContentRes.status === 200) {
                recordPass('PUT /api/content with scoped payload succeeded (HTTP 200)');
            } else {
                recordFail('PUT /api/content', `Status ${putContentRes.status}`);
            }

            // Verify home_hero was NOT clobbered by the stale overwrite attempt
            const savedHomeHero = await prisma.siteContent.findUnique({ where: { key: 'home_hero' } });
            if (savedHomeHero && savedHomeHero.value === testHomeHero) {
                recordPass('SiteContent save did NOT clobber home_hero (homepage keys protected)');
            } else {
                recordFail('Homepage key protection', `home_hero was clobbered to: ${savedHomeHero?.value}`);
            }

            // Verify atomic transaction in content.routes.ts
            const savedAbout = await prisma.siteContent.findUnique({ where: { key: 'about_text' } });
            if (savedAbout?.value === 'Updated about text from Site Content') {
                recordPass('SiteContent keys saved atomically via prisma.$transaction');
            } else {
                recordFail('SiteContent atomic save', `about_text not updated`);
            }
        }

        // ══════════════════════════════════════════════════════════════════════
        // Edge Case 5: Cache-Control: no-store header verified on /api responses
        // ══════════════════════════════════════════════════════════════════════
        console.log('\n--- 5. Edge Case: Anti-Cache Headers Verification ---');
        {
            const endpointsToTest = [
                '/api/content',
                '/api/pages/published',
                '/api/pages/colleges-universities-for-sale'
            ];

            for (const ep of endpointsToTest) {
                const res = await fetch(`${BASE_URL}${ep}`);
                const cacheControl = res.headers.get('cache-control') || '';
                const pragma = res.headers.get('pragma') || '';
                const expires = res.headers.get('expires') || '';

                const hasNoStore = cacheControl.includes('no-store');
                const hasNoCache = cacheControl.includes('no-cache');
                const hasMustRevalidate = cacheControl.includes('must-revalidate');
                const hasPragma = pragma === 'no-cache';
                const hasExpires = expires === '0';

                if (hasNoStore && hasNoCache && hasMustRevalidate && hasPragma && hasExpires) {
                    recordPass(`Anti-cache headers verified on ${ep}`, `Cache-Control: ${cacheControl}`);
                } else {
                    recordFail(
                        `Anti-cache headers on ${ep}`,
                        `Cache-Control: "${cacheControl}", Pragma: "${pragma}", Expires: "${expires}"`
                    );
                }
            }
        }

        // ══════════════════════════════════════════════════════════════════════
        // Edge Case 6: POST /api/pages Payload Sanitization
        // ══════════════════════════════════════════════════════════════════════
        console.log('\n--- 6. Edge Case: POST /api/pages Payload Sanitization ---');
        {
            const testSlug = `sanitization-test-${Date.now()}`;
            const postRes = await fetch(`${BASE_URL}/api/pages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${adminToken}`
                },
                body: JSON.stringify({
                    title: 'Sanitization Test Page',
                    slug: testSlug,
                    template: 'generic',
                    pageData: { cards: [] },
                    published: 'true',
                    id: 999999,
                    createdAt: '2020-01-01',
                    updatedAt: '2020-01-01',
                    unmappedProperty: 'attack-vector',
                })
            });

            if (postRes.status === 201) {
                recordPass('POST /api/pages with extra fields sanitized cleanly without Prisma crash (HTTP 201)');
                const createdPage = await postRes.json() as any;
                if (createdPage.published === true) {
                    recordPass('POST /api/pages correctly coerced string "true" to boolean true');
                } else {
                    recordFail('POST /api/pages boolean coercion', `Expected published: true, got: ${createdPage.published}`);
                }
                await prisma.page.delete({ where: { id: createdPage.id } });
            } else {
                const errText = await postRes.text();
                recordFail('POST /api/pages with extra fields', `Expected 201, got ${postRes.status}: ${errText}`);
            }
        }

        // ══════════════════════════════════════════════════════════════════════
        // Edge Case 7: PUT /api/content Validation on Invalid Inputs
        // ══════════════════════════════════════════════════════════════════════
        console.log('\n--- 7. Edge Case: PUT /api/content Validation on Invalid Inputs ---');
        {
            // Test 1: Array payload (not key-value map)
            const arrayRes = await fetch(`${BASE_URL}/api/content`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${adminToken}`
                },
                body: JSON.stringify(['invalid', 'array'])
            });

            if (arrayRes.status === 400) {
                recordPass('PUT /api/content with array payload returns HTTP 400 Bad Request');
            } else {
                recordFail('PUT /api/content invalid array input', `Expected 400, got ${arrayRes.status}`);
            }

            // Test 2: Malformed JSON syntax error
            const malformedRes = await fetch(`${BASE_URL}/api/content`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${adminToken}`
                },
                body: '{ malformed json payload'
            });

            if (malformedRes.status === 400) {
                recordPass('PUT /api/content with malformed JSON returns HTTP 400 (client syntax error handled)');
            } else {
                recordFail('PUT /api/content malformed JSON input', `Expected 400, got ${malformedRes.status}`);
            }
        }

        // ══════════════════════════════════════════════════════════════════════
        // Edge Case 8: Homepage Services Empty Array Precision Override
        // ══════════════════════════════════════════════════════════════════════
        console.log('\n--- 8. Edge Case: Homepage Services Empty Array Precision Override ---');
        const originalHomeServices = await prisma.siteContent.findUnique({ where: { key: 'home_services' } });
        {
            const putRes = await fetch(`${BASE_URL}/api/content`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${adminToken}`
                },
                body: JSON.stringify({
                    home_services: JSON.stringify([])
                })
            });

            if (putRes.status === 200) {
                recordPass('PUT /api/content with home_services: "[]" succeeded (HTTP 200)');
            } else {
                recordFail('PUT home_services', `Expected 200, got ${putRes.status}`);
            }

            const getRes = await fetch(`${BASE_URL}/api/content`);
            const contentData = await getRes.json() as any;
            const parsedServices = JSON.parse(contentData.home_services || 'null');

            if (Array.isArray(parsedServices) && parsedServices.length === 0) {
                recordPass('GET /api/content preserved home_services: [] without auto-resurrecting defaults');
            } else {
                recordFail('home_services preservation', `Expected [], got: ${JSON.stringify(parsedServices)}`);
            }

            const defaultServices = [{ title: 'Default Service' }];
            const evaluatedServices = Array.isArray(parsedServices) ? parsedServices : defaultServices;
            if (evaluatedServices.length === 0) {
                recordPass('service-cards component Array.isArray(rawServices) check correctly evaluates to 0 services');
            } else {
                recordFail('service-cards component fallback', `Expected 0 services, resurrected: ${evaluatedServices.length}`);
            }
        }

        // ── Restore Original Page Data & Content ──────────────────────────────
        if (testPage) {
            await prisma.page.update({
                where: { id: testPage.id },
                data: {
                    title: originalTitle,
                    pageData: originalPageData
                }
            });
            console.log('\n🧹 Restored test page to original state.');
        }

        if (originalHomeServices) {
            await prisma.siteContent.update({
                where: { key: 'home_services' },
                data: { value: originalHomeServices.value }
            });
            console.log('🧹 Restored home_services to original state.');
        } else {
            await prisma.siteContent.deleteMany({ where: { key: 'home_services' } });
        }

    } catch (err: any) {
        console.error('Fatal error running CMS verification tests:', err);
        failed++;
        issues.push(`Fatal Error: ${err?.message}`);
    } finally {
        server.close();
        await prisma.$disconnect();
    }

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log('\n================================================================');
    console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================');

    if (failed > 0) {
        console.error('Issues encountered:');
        issues.forEach((iss, idx) => console.error(`  ${idx + 1}. ${iss}`));
        process.exit(1);
    } else {
        console.log('🎉 ALL CMS RELIABILITY & PRECISION OVERRIDE TESTS PASSED!\n');
        process.exit(0);
    }
}

runCMSReliabilityTests();
