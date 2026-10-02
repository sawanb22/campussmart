import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { RESUMES_DIR, UPLOADS_DIR } from '../lib/uploads-dir';

const ALLOWED_IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']);
const ALLOWED_VIDEO_EXTS = new Set(['.mp4', '.webm', '.mov', '.mkv']);

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

const createStorage = (folder: string) =>
    multer.diskStorage({
        destination: (_req, _file, cb) => {
            const dir = path.join(UPLOADS_DIR, folder);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        },
        filename: (_req, file, cb) => {
            const rawExt = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/gi, '');
            const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            cb(null, `${unique}${rawExt}`);
        },
    });

export const uploadImage = multer({
    storage: createStorage('images'),
    limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
    fileFilter: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/gi, '');
        if (file.mimetype.startsWith('image/') && ALLOWED_IMAGE_EXTS.has(ext)) cb(null, true);
        else cb(new Error('Only valid image files (JPG, PNG, WEBP, GIF, SVG) are allowed'));
    },
});

export const uploadMedia = multer({
    storage: createStorage('media'),
    limits: { fileSize: MAX_VIDEO_SIZE_BYTES }, // 100 MB stream max allowance
    fileFilter: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/gi, '');
        const isImage = file.mimetype.startsWith('image/') && ALLOWED_IMAGE_EXTS.has(ext);
        const isVideo = file.mimetype.startsWith('video/') && ALLOWED_VIDEO_EXTS.has(ext);
        if (isImage || isVideo) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file format. Supported: Images (JPG, PNG, WEBP, GIF, SVG) and Videos (MP4, WebM, MOV, MKV)'));
        }
    },
});

// Backward-compatible alias
export const uploadMediaImage = uploadMedia;

/**
 * Enforces strict per-type file size limits (5 MB for images, 100 MB for videos).
 * Removes invalid files from disk immediately to prevent storage leakage.
 */
export function validateMediaFileSize(file: Express.Multer.File): { valid: boolean; error?: string } {
    const isVideo = file.mimetype.startsWith('video/');
    if (!isVideo && file.size > MAX_IMAGE_SIZE_BYTES) {
        if (file.path && fs.existsSync(file.path)) {
            try { fs.unlinkSync(file.path); } catch { /* ignore */ }
        }
        return {
            valid: false,
            error: `Image size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 5 MB limit. Please compress or select a smaller image under 5 MB.`,
        };
    }
    if (isVideo && file.size > MAX_VIDEO_SIZE_BYTES) {
        if (file.path && fs.existsSync(file.path)) {
            try { fs.unlinkSync(file.path); } catch { /* ignore */ }
        }
        return {
            valid: false,
            error: `Video size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 100 MB limit. Please trim or compress the video.`,
        };
    }
    return { valid: true };
}

export const uploadPDF = multer({
    storage: createStorage('catalogues'),
    limits: { fileSize: 200 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDF files are allowed'));
    },
});

export const uploadDocument = multer({
    storage: createStorage('documents'),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDF files are allowed'));
    },
});

export const uploadResume = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => {
            if (!fs.existsSync(RESUMES_DIR)) fs.mkdirSync(RESUMES_DIR, { recursive: true });
            cb(null, RESUMES_DIR);
        },
        filename: (_req, file, cb) => {
            const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            cb(null, `${unique}${path.extname(file.originalname).toLowerCase()}`);
        },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowedTypes.includes(file.mimetype)) cb(null, true);
        else cb(new Error('Resume must be a PDF, DOC, or DOCX file'));
    },
});
