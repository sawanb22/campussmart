import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';


export interface AuthRequest extends Request {
    user?: { id: number; email: string; role: string };
}

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; email: string; role: string };
        // Always fetch fresh user data from database to ensure current role and status
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) { 
            res.status(401).json({ error: 'User not found' }); 
            return; 
        }
        if (!user.emailVerified) {
            res.status(403).json({ error: 'Email verification required', code: 'EMAIL_NOT_VERIFIED' });
            return;
        }
        // Use database role, not JWT role, for accurate permission checks
        req.user = { id: user.id, email: user.email, role: user.role || 'user' };
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }
    // Strict admin check - role must be exactly 'admin'
    if (req.user.role !== 'admin') {
        console.warn(`Admin access denied for user ${req.user.id} with role: ${req.user.role}`);
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
    next();
};

// Same check as verifyToken, but also accepts the token as a `?token=` query
// param. Needed for gating static file downloads (e.g. catalogue PDFs) that are
// reached via a plain <a href> or window.open — those never carry a custom
// Authorization header, only fetch()/XHR calls can, so this is the fallback
// for any request that can't attach one.
export const verifyTokenFromQueryOrHeader = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const queryToken = typeof req.query.token === 'string' ? req.query.token : undefined;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : queryToken;

    if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; email: string; role: string };
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) {
            res.status(401).json({ error: 'User not found' });
            return;
        }
        if (!user.emailVerified) {
            res.status(403).json({ error: 'Email verification required', code: 'EMAIL_NOT_VERIFIED' });
            return;
        }
        req.user = { id: user.id, email: user.email, role: user.role || 'user' };
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
};

export const optionalAuth = async (req: AuthRequest, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return next();
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; email: string; role: string };
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (user && user.emailVerified) {
            req.user = { id: user.id, email: user.email, role: user.role || 'user' };
        }
    } catch { /* ignore */ }
    next();
};
