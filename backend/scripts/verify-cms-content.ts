process.env.VERCEL = '1';

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import jwt from 'jsonwebtoken';
import app from '../src/index';
import prisma from '../src/lib/prisma';
import fs from 'fs';

async function runCMSVerification() {
    console.log('🔍 Starting Comprehensive CMS & Content Verification...\n');

    let passed = 0;
    let failed = 0;
    const issues: string[] = [];

    const recordPass = (msg: string) => {
        console.log(`✅ PASS: ${msg}`);
        passed++;
    };

    const recordFail = (msg: string, detail?: string) => {
        console.error(`❌ FAIL: ${msg} ${detail ? `-> ${detail}` : ''}`);
        failed++;
        issues.push(`${msg}: ${detail || 'Failed'}`);
    };

    const TEST_PORT = 3997;
    const server = app.listen(TEST_PORT);
    const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

    try {
        // ── 1. Admin Login & CMS Token Generation ─────────────────────────────
        console.log('--- 1. Admin CMS Login & Access ---');
        const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
        if (!adminUser) {
            throw new Error('No admin user found in database!');
        }

        const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
        const adminToken = jwt.sign(
            { id: adminUser.id, email: adminUser.email, role: 'admin' },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        const normalUser = await prisma.user.findFirst({ where: { role: 'user' } });
        const userToken = normalUser ? jwt.sign(
            { id: normalUser.id, email: normalUser.email, role: 'user' },
            JWT_SECRET,
            { expiresIn: '1d' }
        ) : null;

        // Verify GET /api/content (public)
        const getContentRes = await fetch(`${BASE_URL}/api/content`);
        if (getContentRes.status === 200) {
            recordPass('Public GET /api/content returns 200 OK');
        } else {
            recordFail('Public GET /api/content', `Status ${getContentRes.status}`);
        }

        // Verify PUT /api/content RBAC
        const unauthPutContent = await fetch(`${BASE_URL}/api/content`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ test_key: 'test_val' }),
        });
        if (unauthPutContent.status === 401) {
            recordPass('PUT /api/content without token returns 401 Unauthorized');
        } else {
            recordFail('PUT /api/content unauthenticated', `Expected 401, got ${unauthPutContent.status}`);
        }

        if (userToken) {
            const userPutContent = await fetch(`${BASE_URL}/api/content`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
                body: JSON.stringify({ test_key: 'test_val' }),
            });
            if (userPutContent.status === 403) {
                recordPass('PUT /api/content with user token returns 403 Forbidden');
            } else {
                recordFail('PUT /api/content with user token', `Expected 403, got ${userPutContent.status}`);
            }
        }

        // ── 2. Homepage Editor & Site Content Pipeline ────────────────────────
        console.log('\n--- 2. Homepage Editor & Site Content Pipeline ---');
        const testTimestamp = Date.now().toString();
        const testUpdatePayload = {
            test_cms_audit_key: `audit_value_${testTimestamp}`,
            home_hero: JSON.stringify({
                eyebrow: 'Audit Eyebrow',
                title: 'Audit Hero Title',
                subtitle: 'Audit Hero Subtitle',
                ctaLabel: 'Audit CTA',
                ctaHref: '/audit',
                image: 'https://example.com/audit.jpg'
            })
        };

        const adminPutContent = await fetch(`${BASE_URL}/api/content`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
            body: JSON.stringify(testUpdatePayload),
        });

        if (adminPutContent.status === 200) {
            recordPass('PUT /api/content with admin token returns 200 OK');
            // Verify persisted in DB
            const verifyGet = await fetch(`${BASE_URL}/api/content`);
            const verifyData: any = await verifyGet.json();
            if (verifyData.test_cms_audit_key === `audit_value_${testTimestamp}`) {
                recordPass('Persisted content key successfully retrieved from GET /api/content');
            } else {
                recordFail('Persisted content key retrieval', 'Key value does not match update');
            }
        } else {
            recordFail('PUT /api/content with admin token', `Status ${adminPutContent.status}`);
        }

        // Clean up test key
        await prisma.siteContent.deleteMany({ where: { key: 'test_cms_audit_key' } });

        // ── 3. Pages Manager & Page Editor API ────────────────────────────────
        console.log('\n--- 3. Pages Manager API & Permissions ---');
        // Unauthenticated GET /api/pages
        const unauthGetPages = await fetch(`${BASE_URL}/api/pages`);
        if (unauthGetPages.status === 401) {
            recordPass('GET /api/pages without token returns 401 Unauthorized');
        } else {
            recordFail('GET /api/pages unauthenticated', `Expected 401, got ${unauthGetPages.status}`);
        }

        // Admin GET /api/pages
        const adminGetPages = await fetch(`${BASE_URL}/api/pages`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });
        let allPages: any[] = [];
        if (adminGetPages.status === 200) {
            allPages = (await adminGetPages.json()) as any[];
            recordPass(`Admin GET /api/pages returned 200 OK with ${allPages.length} pages`);
        } else {
            recordFail('Admin GET /api/pages', `Status ${adminGetPages.status}`);
        }

        // Public GET /api/pages/published
        const publicGetPages = await fetch(`${BASE_URL}/api/pages/published`);
        if (publicGetPages.status === 200) {
            const pub: any = await publicGetPages.json();
            recordPass(`Public GET /api/pages/published returns 200 OK with ${pub.length} published pages`);
        } else {
            recordFail('Public GET /api/pages/published', `Status ${publicGetPages.status}`);
        }

        // Test Page CRUD: Create, Read, Update, Delete
        console.log('\n--- 4. Page CRUD Lifecycle ---');
        const testSlug = `audit-test-page-${Date.now()}`;
        const createPageRes = await fetch(`${BASE_URL}/api/pages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
            body: JSON.stringify({
                title: 'Audit Test Page',
                slug: testSlug,
                template: 'generic',
                published: false,
                pageData: JSON.stringify({ heroTitle: 'Audit Title' })
            }),
        });

        let createdPageId: number | null = null;
        if (createPageRes.status === 201) {
            const created: any = await createPageRes.json();
            createdPageId = created.id;
            recordPass(`POST /api/pages created test page with ID ${createdPageId}`);

            // Fetch by slug
            const fetchSlugRes = await fetch(`${BASE_URL}/api/pages/${testSlug}`);
            if (fetchSlugRes.status === 200) {
                const fetched: any = await fetchSlugRes.json();
                if (fetched.id === createdPageId && fetched.published === false) {
                    recordPass('GET /api/pages/:slug retrieved the unpublished page');
                } else {
                    recordFail('GET /api/pages/:slug', 'Mismatch in page data');
                }
            } else {
                recordFail('GET /api/pages/:slug', `Status ${fetchSlugRes.status}`);
            }

            // Update page (publish and change title)
            const updatePageRes = await fetch(`${BASE_URL}/api/pages/${createdPageId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
                body: JSON.stringify({
                    title: 'Audit Test Page Updated',
                    published: true,
                }),
            });
            if (updatePageRes.status === 200) {
                const updated: any = await updatePageRes.json();
                if (updated.title === 'Audit Test Page Updated' && updated.published === true) {
                    recordPass('PUT /api/pages/:id updated title and published status');
                } else {
                    recordFail('PUT /api/pages/:id', 'Update fields mismatch');
                }
            } else {
                recordFail('PUT /api/pages/:id', `Status ${updatePageRes.status}`);
            }

            // Delete page
            const deletePageRes = await fetch(`${BASE_URL}/api/pages/${createdPageId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${adminToken}` },
            });
            if (deletePageRes.status === 204) {
                recordPass('DELETE /api/pages/:id deleted test page with 204 No Content');
            } else {
                recordFail('DELETE /api/pages/:id', `Status ${deletePageRes.status}`);
            }
        } else {
            recordFail('POST /api/pages', `Status ${createPageRes.status}`);
        }

        // ── 5. Media & Document Upload Functionality ─────────────────────────
        console.log('\n--- 5. Media & Document Upload Functionality ---');
        // Test media upload with dummy buffer
        const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
        const dummyImage = Buffer.from('GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;');
        
        const imageBodyParts = [
            `--${boundary}\r\n`,
            'Content-Disposition: form-data; name="image"; filename="test.gif"\r\n',
            'Content-Type: image/gif\r\n\r\n',
            dummyImage,
            `\r\n--${boundary}--\r\n`
        ];
        const imagePayload = Buffer.concat(imageBodyParts.map(p => typeof p === 'string' ? Buffer.from(p) : p));

        const uploadMediaRes = await fetch(`${BASE_URL}/api/media`, {
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                Authorization: `Bearer ${adminToken}`,
            },
            body: imagePayload,
        });

        if (uploadMediaRes.status === 201) {
            const mediaData: any = await uploadMediaRes.json();
            recordPass(`POST /api/media uploaded file: ${mediaData.url}`);

            // Test static access to uploaded media
            const staticRes = await fetch(`${BASE_URL}${mediaData.url}`);
            if (staticRes.status === 200) {
                recordPass(`Static fetch of uploaded media returns 200 OK (${mediaData.url})`);
            } else {
                recordFail('Static fetch of uploaded media', `Status ${staticRes.status}`);
            }

            // Cleanup uploaded file from disk
            const localFilePath = path.join(__dirname, '../uploads/media', mediaData.filename);
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath);
            }
        } else {
            recordFail('POST /api/media upload', `Status ${uploadMediaRes.status}`);
        }

        // Test Document Upload (PDF)
        const dummyPdf = Buffer.from('%PDF-1.4\n%...\n%%EOF');
        const pdfBodyParts = [
            `--${boundary}\r\n`,
            'Content-Disposition: form-data; name="file"; filename="test.pdf"\r\n',
            'Content-Type: application/pdf\r\n\r\n',
            dummyPdf,
            `\r\n--${boundary}--\r\n`
        ];
        const pdfPayload = Buffer.concat(pdfBodyParts.map(p => typeof p === 'string' ? Buffer.from(p) : p));

        const uploadDocRes = await fetch(`${BASE_URL}/api/pages/upload-document`, {
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                Authorization: `Bearer ${adminToken}`,
            },
            body: pdfPayload,
        });

        if (uploadDocRes.status === 201) {
            const docData: any = await uploadDocRes.json();
            recordPass(`POST /api/pages/upload-document uploaded PDF: ${docData.url}`);
            // Cleanup
            const docFileName = path.basename(docData.url);
            const docFilePath = path.join(__dirname, '../uploads/documents', docFileName);
            if (fs.existsSync(docFilePath)) {
                fs.unlinkSync(docFilePath);
            }
        } else {
            recordFail('POST /api/pages/upload-document', `Status ${uploadDocRes.status}`);
        }

        // ── 6. Check Database Page Templates & Fallback Mismatches ─────────────
        console.log('\n--- 6. Checking Database Page Templates & Fallback Mismatches ---');
        const checkSlugs = [
            'lab-products',
            'library-products',
            'sports-products',
            'assessment-system',
            'home',
            'resources',
            'privacy-policy',
            'terms-of-use',
            'digital-transformation',
            'campus-design'
        ];

        for (const slug of checkSlugs) {
            const page = await prisma.page.findUnique({ where: { slug } });
            if (page) {
                console.log(`DB Page "${slug}": template="${page.template}", published=${page.published}, hasPageData=${Boolean(page.pageData && page.pageData !== '{}')}`);
            } else {
                console.log(`DB Page "${slug}": NOT in database`);
            }
        }

    } catch (err: any) {
        console.error('Unhandled verification error:', err);
    } finally {
        server.close();
    }

    console.log('\n==========================================');
    console.log(`Verification Summary: ${passed} PASSED, ${failed} FAILED`);
    if (issues.length > 0) {
        console.log('Issues found:');
        issues.forEach(iss => console.log(` - ${iss}`));
    }
    console.log('==========================================\n');
}

runCMSVerification();
