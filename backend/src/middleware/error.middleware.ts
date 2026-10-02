import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    const status = typeof err.status === 'number' ? err.status : (err instanceof SyntaxError && 'body' in err ? 400 : 500);
    res.status(status).json({ error: err.message || 'Internal server error' });
};
