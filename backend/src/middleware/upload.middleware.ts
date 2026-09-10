import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { RESUMES_DIR, UPLOADS_DIR } from '../lib/uploads-dir';

const createStorage = (folder: string) =>
    multer.diskStorage({
        destination: (_req, _file, cb) => {
            const dir = path.join(UPLOADS_DIR, folder);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        },
        filename: (_req, file, cb) => {
            const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            cb(null, `${unique}${path.extname(file.originalname)}`);
        },
    });

export const uploadImage = multer({
    storage: createStorage('images'),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only image files are allowed'));
    },
});

export const uploadMediaImage = multer({
    storage: createStorage('media'),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only image files are allowed'));
    },
});

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
