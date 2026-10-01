import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import prisma from '../src/lib/prisma';
import { UPLOADS_DIR, RESUMES_DIR } from '../src/lib/uploads-dir';

interface TestResult {
    id: number;
    name: string;
    passed: boolean;
    details: string;
}

const results: TestResult[] = [];

function record(name: string, passed: boolean, details: string) {
    const id = results.length + 1;
    results.push({ id, name, passed, details });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`[${mark}] Test ${id}: ${name} — ${details}`);
}

async function runPreflight() {
    console.log('\n============================================================');
    console.log('🚀 CAMPUSMART PRODUCTION PRE-FLIGHT VERIFICATION SUITE');
    console.log('============================================================\n');

    // ── Test 1: Required Environment Variables ───────────────────────
    try {
        const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'FRONTEND_URL', 'EMAIL_USER', 'EMAIL_PASS', 'GROQ_API_KEY'];
        const missing = requiredVars.filter(v => !process.env[v]);
        const isSecretInsecure = process.env.JWT_SECRET === 'your_super_secret_jwt_key_here' || (process.env.JWT_SECRET?.length || 0) < 16;
        
        if (missing.length === 0 && !isSecretInsecure) {
            record('Environment Variables Audit', true, `All required keys present. JWT Secret length: ${process.env.JWT_SECRET?.length} chars.`);
        } else {
            record('Environment Variables Audit', false, `Missing: ${missing.join(', ')}. Insecure secret: ${isSecretInsecure}`);
        }
    } catch (e: any) {
        record('Environment Variables Audit', false, e.message);
    }

    // ── Test 2: Live Database Ping & Latency ──────────────────────────
    try {
        const start = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        const latency = Date.now() - start;
        record('Neon Cloud Database Ping', true, `Connected to Neon PostgreSQL. Latency: ${latency}ms.`);
    } catch (e: any) {
        record('Neon Cloud Database Ping', false, `Failed to query DB: ${e.message}`);
    }

    // ── Test 3: Core Database Tables & Model Parity ────────────────────
    try {
        const [users, products, categories, pages, enquiries, siteContent] = await Promise.all([
            prisma.user.count(),
            prisma.product.count(),
            prisma.category.count(),
            prisma.page.count(),
            prisma.contactEnquiry.count(),
            prisma.siteContent.count(),
        ]);
        const healthy = products >= 100 && pages >= 50 && categories >= 10 && users >= 1;
        record(
            'Database Tables & Record Health',
            healthy,
            `Users: ${users}, Products: ${products}, Categories: ${categories}, Pages: ${pages}, Enquiries: ${enquiries}, SiteContent: ${siteContent}.`
        );
    } catch (e: any) {
        record('Database Tables & Record Health', false, e.message);
    }

    // ── Test 4: Administrator User & Email Verification ──────────────
    try {
        const admin = await prisma.user.findFirst({
            where: { role: 'admin' },
            select: { id: true, email: true, role: true, emailVerified: true },
        });
        if (admin && admin.emailVerified) {
            record('Admin Account Verification', true, `Admin found: ${admin.email} (ID: ${admin.id}, verified: ${admin.emailVerified}).`);
        } else if (admin && !admin.emailVerified) {
            record('Admin Account Verification', false, `Admin ${admin.email} exists but emailVerified is false.`);
        } else {
            record('Admin Account Verification', false, 'No user with role=admin found in database.');
        }
    } catch (e: any) {
        record('Admin Account Verification', false, e.message);
    }

    // ── Test 5: CORS Origins & URL Normalization ──────────────────────
    try {
        const toOrigin = (value: string): string | null => {
            try { return new URL(value.trim()).origin; } catch { return null; }
        };
        const rawOrigins = [process.env.FRONTEND_URL, process.env.ADMIN_URL]
            .filter(Boolean)
            .flatMap(v => (v as string).split(','))
            .map(toOrigin)
            .filter(Boolean) as string[];

        const hasProductionDomain = rawOrigins.some(o => o.includes('campusmart.in'));
        if (hasProductionDomain) {
            record('CORS Production Whitelist', true, `Production origins normalized: ${rawOrigins.join(', ')}.`);
        } else {
            record('CORS Production Whitelist', false, `campusmart.in missing from normalized origins: ${rawOrigins.join(', ')}`);
        }
    } catch (e: any) {
        record('CORS Production Whitelist', false, e.message);
    }

    // ── Test 6: Storage & Upload Directories Resolution ───────────────
    try {
        if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
        if (!fs.existsSync(RESUMES_DIR)) fs.mkdirSync(RESUMES_DIR, { recursive: true });

        const testUploadFile = path.join(UPLOADS_DIR, '.probe.tmp');
        fs.writeFileSync(testUploadFile, 'probe');
        fs.unlinkSync(testUploadFile);

        record('Storage & Upload Paths', true, `Uploads: ${UPLOADS_DIR}, Resumes: ${RESUMES_DIR} (Writable).`);
    } catch (e: any) {
        record('Storage & Upload Paths', false, e.message);
    }

    // ── Test 7: SMTP Transporter Verification ────────────────────────
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            connectionTimeout: 10_000,
            greetingTimeout: 10_000,
            socketTimeout: 10_000,
        });
        await new Promise<void>((resolve, reject) => {
            transporter.verify((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        record('Email SMTP Handshake', true, `Gmail SMTP credentials authenticated for ${process.env.EMAIL_USER}.`);
    } catch (e: any) {
        record('Email SMTP Handshake', false, `SMTP verification failed: ${e.message}`);
    }

    // ── Test 8: Frontend Production Bundle Integrity ─────────────────
    try {
        const distDir = path.resolve(process.cwd(), '../dist');
        const indexHtml = path.join(distDir, 'index.html');
        const assetsDir = path.join(distDir, 'assets');

        const hasIndexHtml = fs.existsSync(indexHtml);
        const hasAssets = fs.existsSync(assetsDir) && fs.readdirSync(assetsDir).length > 20;

        if (hasIndexHtml && hasAssets) {
            const htmlContent = fs.readFileSync(indexHtml, 'utf8');
            const hasRoot = htmlContent.includes('id="root"');
            record('Frontend Static Bundle (dist/)', hasRoot, `index.html exists (with #root), ${fs.readdirSync(assetsDir).length} chunk files compiled.`);
        } else {
            record('Frontend Static Bundle (dist/)', false, `dist/ directory incomplete. indexHtml: ${hasIndexHtml}, assets: ${hasAssets}.`);
        }
    } catch (e: any) {
        record('Frontend Static Bundle (dist/)', false, e.message);
    }

    // ── Test 9: Vercel SPA Rewrites Configuration ────────────────────
    try {
        const vercelJsonPath = path.resolve(process.cwd(), '../vercel.json');
        if (fs.existsSync(vercelJsonPath)) {
            const config = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
            const hasRewrites = Array.isArray(config.rewrites) && config.rewrites.some((r: any) => r.destination === '/index.html');
            record('Vercel SPA Rewrites Config', hasRewrites, 'Wildcard rewrite to /index.html verified in vercel.json.');
        } else {
            record('Vercel SPA Rewrites Config', false, 'vercel.json not found in frontend directory.');
        }
    } catch (e: any) {
        record('Vercel SPA Rewrites Config', false, e.message);
    }

    // ── Test 10: Backend Railway Deployment Config ────────────────────
    try {
        const railwayJsonPath = path.resolve(process.cwd(), 'railway.json');
        if (fs.existsSync(railwayJsonPath)) {
            const config = JSON.parse(fs.readFileSync(railwayJsonPath, 'utf8'));
            const valid = config.build?.buildCommand === 'npm run build' && config.deploy?.startCommand === 'npm run start';
            record('Railway Deployment Spec', valid, `Build: ${config.build?.buildCommand}, Deploy: ${config.deploy?.startCommand}.`);
        } else {
            record('Railway Deployment Spec', false, 'railway.json not found in backend directory.');
        }
    } catch (e: any) {
        record('Railway Deployment Spec', false, e.message);
    }

    // ── Final Audit Summary ──────────────────────────────────────────
    console.log('\n============================================================');
    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;
    console.log(`PRE-FLIGHT AUDIT SUMMARY: ${passedCount}/${totalCount} TESTS PASSED`);
    console.log('============================================================\n');

    if (passedCount === totalCount) {
        console.log('🟢 ALL SYSTEMS GO! The project is 100% verified and ready for live hosting today.');
        process.exit(0);
    } else {
        console.error('🔴 PRE-FLIGHT BLOCKED! Resolve failed checks before production deployment.');
        process.exit(1);
    }
}

runPreflight()
    .catch((err) => {
        console.error('Fatal preflight error:', err);
        process.exit(1);
    })
    .finally(() => {
        prisma.$disconnect();
    });
