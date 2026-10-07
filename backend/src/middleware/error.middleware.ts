import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    const status = typeof err.status === 'number' ? err.status : (err instanceof SyntaxError && 'body' in err ? 400 : 500);
    const message = (status === 500 && process.env.NODE_ENV === 'production')
        ? 'An internal server error occurred'
        : (err.message || 'Internal server error');
    res.status(status).json({ error: message });
};
