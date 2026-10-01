process.env.VERCEL = '1';

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import jwt from 'jsonwebtoken';
import app from '../src/index';
import prisma from '../src/lib/prisma';
import { generateOtp } from '../src/lib/email';

async function runTests() {
    console.log('🚀 Starting Security & Auth Route Hardening Tests...\n');

    let passed = 0;
    let failed = 0;

    const assert = (condition: boolean, testName: string, detail?: string) => {
        if (condition) {
            console.log(`✅ PASS: ${testName}`);
            passed++;
        } else {
            console.error(`❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
            failed++;
        }
    };

    // ── Test 1: OTP Generation ──────────────────────────────────────
    console.log('--- Testing OTP PRNG ---');
    const otps = new Set<string>();
    for (let i = 0; i < 50; i++) {
        otps.add(generateOtp());
    }
    const allSixDigits = Array.from(otps).every((code) => /^\d{6}$/.test(code));
    assert(allSixDigits, 'generateOtp() produces 6-digit numeric codes');
    assert(otps.size >= 45, 'generateOtp() has high entropy (at least 45 unique codes in 50 samples)');

    // ── Start Test Server ───────────────────────────────────────────
    const TEST_PORT = 3998;
    const server = app.listen(TEST_PORT);
    const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

    try {
        // Find existing admin and regular user in database (or create temporary mocks)
        let adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
        let normalUser = await prisma.user.findFirst({ where: { role: 'user' } });

        if (!adminUser) {
            console.log('ℹ️ Creating temporary test admin user...');
            adminUser = await prisma.user.create({
                data: {
                    name: 'Test Admin',
                    email: `testadmin_${Date.now()}@test.com`,
                    passwordHash: 'testhash',
                    role: 'admin',
                },
            });
        }

        if (!normalUser) {
            console.log('ℹ️ Creating temporary test normal user...');
            normalUser = await prisma.user.create({
                data: {
                    name: 'Test User',
                    email: `testuser_${Date.now()}@test.com`,
                    passwordHash: 'testhash',
                    role: 'user',
                },
            });
        }

        const adminToken = jwt.sign(
            { id: adminUser.id, email: adminUser.email, role: adminUser.role },
            process.env.JWT_SECRET!
        );

        const userToken = jwt.sign(
            { id: normalUser.id, email: normalUser.email, role: normalUser.role },
            process.env.JWT_SECRET!
        );

        console.log('\n--- Testing Backdoor Elimination ---');

        // ── Test 2: GET /api/blog/seed-data Backdoor Removed ─────────
        const resBlogSeed = await fetch(`${BASE_URL}/api/blog/seed-data?secret=admin123`);
        assert(
            resBlogSeed.status === 404,
            'GET /api/blog/seed-data returns 404 Not Found (backdoor eradicated)',
            `Got status ${resBlogSeed.status}`
        );

        // ── Test 3: POST /api/admin/ensure-admin Backdoor Removed ───
        const resEnsureAdmin = await fetch(`${BASE_URL}/api/admin/ensure-admin`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${userToken}`,
                'x-admin-secret': 'admin-secret-key-not-set',
            },
        });
        assert(
            resEnsureAdmin.status === 404,
            'POST /api/admin/ensure-admin returns 404 Not Found (backdoor eradicated)',
            `Got status ${resEnsureAdmin.status}`
        );

        console.log('\n--- Testing Admin Route Access Controls ---');

        // ── Test 4: GET /api/admin/stats without token -> 401 ────────
        const resStatsNoAuth = await fetch(`${BASE_URL}/api/admin/stats`);
        assert(
            resStatsNoAuth.status === 401,
            'GET /api/admin/stats without token returns 401 Unauthorized',
            `Got status ${resStatsNoAuth.status}`
        );

        // ── Test 5: GET /api/admin/stats with regular user token -> 403
        const resStatsUser = await fetch(`${BASE_URL}/api/admin/stats`, {
            headers: { Authorization: `Bearer ${userToken}` },
        });
        assert(
            resStatsUser.status === 403,
            'GET /api/admin/stats with regular user token returns 403 Forbidden',
            `Got status ${resStatsUser.status}`
        );

        // ── Test 6: GET /api/admin/stats with admin token -> 200 ─────
        const resStatsAdmin = await fetch(`${BASE_URL}/api/admin/stats`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });
        assert(
            resStatsAdmin.status === 200,
            'GET /api/admin/stats with admin token returns 200 OK',
            `Got status ${resStatsAdmin.status}`
        );

        console.log('\n--- Testing Blog Draft Protection (?all=true) ---');

        // ── Test 7: GET /api/blog?all=true without token ─────────────
        const resBlogPublic = await fetch(`${BASE_URL}/api/blog?all=true`);
        const blogPublicData = (await resBlogPublic.json()) as any;
        const publicOnlyPublished = (blogPublicData.posts || []).every((p: any) => p.published === true);
        assert(
            resBlogPublic.status === 200 && publicOnlyPublished,
            'GET /api/blog?all=true unauthenticated returns ONLY published posts (drafts hidden)',
            `Status ${resBlogPublic.status}`
        );

        // ── Test 8: GET /api/blog?all=true with user token ───────────
        const resBlogUser = await fetch(`${BASE_URL}/api/blog?all=true`, {
            headers: { Authorization: `Bearer ${userToken}` },
        });
        const blogUserData = (await resBlogUser.json()) as any;
        const userOnlyPublished = (blogUserData.posts || []).every((p: any) => p.published === true);
        assert(
            resBlogUser.status === 200 && userOnlyPublished,
            'GET /api/blog?all=true with user token returns ONLY published posts (drafts hidden)',
            `Status ${resBlogUser.status}`
        );

        // ── Test 9: GET /api/blog?all=true with admin token ──────────
        const resBlogAdmin = await fetch(`${BASE_URL}/api/blog?all=true`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });
        assert(
            resBlogAdmin.status === 200,
            'GET /api/blog?all=true with admin token returns 200 OK with full catalog',
            `Status ${resBlogAdmin.status}`
        );

        console.log('\n--- Testing Blog Draft Direct Slug Protection (/api/blog/:slug) ---');

        // Create temporary draft post
        const draftSlug = `draft-post-${Date.now()}`;
        const draftPost = await prisma.blogPost.create({
            data: {
                title: 'Secret Draft Post',
                slug: draftSlug,
                excerpt: 'This is a secret draft.',
                body: '<p>Secret unpublished content</p>',
                published: false,
                authorId: adminUser.id,
            },
        });

        try {
            // ── Test 10: GET /api/blog/:slug for draft without token -> 404
            const resDraftPublic = await fetch(`${BASE_URL}/api/blog/${draftSlug}`);
            assert(
                resDraftPublic.status === 404,
                'GET /api/blog/:slug unauthenticated returns 404 Not Found for unpublished draft',
                `Status ${resDraftPublic.status}`
            );

            // ── Test 11: GET /api/blog/:slug for draft with regular user token -> 404
            const resDraftUser = await fetch(`${BASE_URL}/api/blog/${draftSlug}`, {
                headers: { Authorization: `Bearer ${userToken}` },
            });
            assert(
                resDraftUser.status === 404,
                'GET /api/blog/:slug with user token returns 404 Not Found for unpublished draft',
                `Status ${resDraftUser.status}`
            );

            // ── Test 12: GET /api/blog/:slug for draft with admin token -> 200 OK
            const resDraftAdmin = await fetch(`${BASE_URL}/api/blog/${draftSlug}`, {
                headers: { Authorization: `Bearer ${adminToken}` },
            });
            assert(
                resDraftAdmin.status === 200,
                'GET /api/blog/:slug with admin token returns 200 OK for draft preview',
                `Status ${resDraftAdmin.status}`
            );
        } finally {
            await prisma.blogPost.delete({ where: { id: draftPost.id } });
        }

    } finally {
        server.close();
        await prisma.$disconnect();
    }

    console.log(`\n==========================================`);
    console.log(`Test Summary: ${passed} PASSED, ${failed} FAILED`);
    console.log(`==========================================\n`);

    if (failed > 0) {
        process.exit(1);
    }
}

runTests().catch((err) => {
    console.error('Fatal test error:', err);
    process.exit(1);
});
