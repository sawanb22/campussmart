import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import dns from 'dns';
import { globalLimiter, authLimiter, otpLimiter } from './middleware/rate-limit.middleware';
export { authLimiter, otpLimiter };

// Enforce IPv4-first resolution across all Node sockets to eliminate ENETUNREACH on Render/Docker
if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
}

dotenv.config();

function validateEnv() {
    const required = ['DATABASE_URL', 'JWT_SECRET'];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`CRITICAL: Missing required environment variables: ${missing.join(', ')}`);
    }
    if (process.env.NODE_ENV === 'production') {
        if (
            process.env.JWT_SECRET === 'your_super_secret_jwt_key_here' ||
            process.env.JWT_SECRET === 'your-jwt-secret'
        ) {
            throw new Error('CRITICAL: Insecure default JWT_SECRET cannot be used in production.');
        }
    }
}
validateEnv();

import authRoutes from './routes/auth.routes';
import productRoutes from './routes/products.routes';
import blogRoutes from './routes/blog.routes';
import orderRoutes from './routes/orders.routes';
import wishlistRoutes from './routes/wishlist.routes';
import addressRoutes from './routes/addresses.routes';
import classifiedRoutes from './routes/classifieds.routes';
import contactRoutes from './routes/contact.routes';
import catalogueRoutes from './routes/catalogues.routes';
import caseStudyRoutes from './routes/case-studies.routes';
import adminRoutes from './routes/admin.routes';
import contentRoutes from './routes/content.routes';
import pagesRoutes from './routes/pages.routes';
import mediaRoutes from './routes/media.routes';
import chatbotRoutes from './routes/chatbot.routes';
import { errorHandler } from './middleware/error.middleware';
import { verifyTokenFromQueryOrHeader } from './middleware/auth.middleware';
import { UPLOADS_DIR } from './lib/uploads-dir';

const app = express();
const PORT = process.env.PORT || 3001;

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
console.log(`Serving uploads from: ${UPLOADS_DIR}`);

// Security middleware - allow external images (Unsplash, CDNs, etc.)
app.use(helmet({ 
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false 
}));
// Env vars may hold a single URL or a comma-separated list, sometimes with a
// stray path, trailing slash, or missing protocol; normalize everything down to bare origins
// (scheme+host+port) so formatting typos in Render/Vercel env vars don't break traffic.
const normalizeOrigin = (raw: string): string | null => {
    if (!raw) return null;
    let trimmed = raw.trim();
    if (!trimmed) return null;
    // Auto-prepend https:// if scheme was omitted (e.g. "campussmart.vercel.app")
    if (!/^https?:\/\//i.test(trimmed)) {
        trimmed = `https://${trimmed}`;
    }
    try {
        return new URL(trimmed).origin;
    } catch {
        return null;
    }
};

// Fully environment-variable driven CORS configuration
const envOrigins = [
    process.env.FRONTEND_URL,
    process.env.ADMIN_URL,
    process.env.ALLOWED_ORIGINS,
]
    .filter(Boolean)
    .flatMap((value) => (value as string).split(','))
    .map(normalizeOrigin)
    .filter(Boolean) as string[];

const devOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:3000',
];

const allowedOrigins = Array.from(new Set([
    ...envOrigins,
    ...(process.env.NODE_ENV !== 'production' ? devOrigins : []),
]));

console.log('🔒 CORS allowed origins:', allowedOrigins.length > 0 ? allowedOrigins : '(none configured - set FRONTEND_URL in environment)');

const isOriginAllowed = (origin: string): boolean => {
    if (allowedOrigins.includes(origin)) return true;

    // Optional: allow Vercel preview branch deployments if enabled via env var
    if (process.env.ALLOW_VERCEL_PREVIEWS === 'true') {
        try {
            const parsed = new URL(origin);
            if (parsed.hostname.endsWith('.vercel.app')) return true;
        } catch {
            return false;
        }
    }

    return false;
};

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, server-to-server health checks)
        if (!origin) return callback(null, true);
        // Allow all origins in local development and tunnels
        if (process.env.NODE_ENV !== 'production') return callback(null, true);
        // Allow strictly permitted origins in production
        if (isOriginAllowed(origin)) return callback(null, true);

        console.warn(`[CORS Blocked] Origin "${origin}" not allowed. Add it to FRONTEND_URL in Render environment variables.`);
        callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

// Global rate limiting
app.use(globalLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files (uploaded images/PDFs/videos). Catalogue PDFs are restricted to logged-in
// users, so that mount is gated and registered before the general public one.
const staticOptions = {
    maxAge: '7d',
    immutable: true,
};
app.use('/uploads/catalogues', verifyTokenFromQueryOrHeader, express.static(path.join(UPLOADS_DIR, 'catalogues')));
app.use('/uploads', express.static(UPLOADS_DIR, staticOptions));
const rootUploadsFallback = path.resolve(UPLOADS_DIR, '../../uploads');
if (fs.existsSync(rootUploadsFallback) && rootUploadsFallback !== UPLOADS_DIR) {
    app.use('/uploads', express.static(rootUploadsFallback, staticOptions));
}

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Anti-cache middleware for API routes to guarantee fresh CMS delivery
app.use('/api', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/classifieds', classifiedRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/catalogues', catalogueRoutes);
app.use('/api/case-studies', caseStudyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Serve compiled frontend static assets for single-origin deployments/tunnels
const DIST_DIR = path.resolve(__dirname, '../../dist');
if (fs.existsSync(DIST_DIR)) {
    app.use(express.static(DIST_DIR));
    app.use((req, res, next) => {
        if (req.method !== 'GET') return next();
        if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path === '/health') {
            return next();
        }
        res.sendFile(path.join(DIST_DIR, 'index.html'));
    });
}

// Error handler must be last
app.use(errorHandler);

if (!process.env.VERCEL) {
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`CampusMart Backend running on port ${PORT}`);
  });
}

export default app;
