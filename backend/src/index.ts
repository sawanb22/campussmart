import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

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
// stray path or trailing slash; normalize everything down to bare origins
// (scheme+host+port) so a formatting typo can't silently lock out real traffic.
const toOrigin = (value: string): string | null => {
    try {
        return new URL(value.trim()).origin;
    } catch {
        return null;
    }
};

const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.ADMIN_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
]
    .filter(Boolean)
    .flatMap((value) => (value as string).split(','))
    .map(toOrigin)
    .filter(Boolean) as string[];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        // Allow any vercel.app subdomain or Cloudflare/local tunnel
        if (origin.endsWith('.vercel.app') || origin.endsWith('.trycloudflare.com') || origin.endsWith('.loca.lt')) return callback(null, true);
        // Allow explicitly listed origins
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
}));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });
app.use(limiter);

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
