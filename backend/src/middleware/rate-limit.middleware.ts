import rateLimit from 'express-rate-limit';

const isProd = process.env.NODE_ENV === 'production';

// Global rate limiting
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isProd ? 500 : 5000,
});

// Dedicated rate limiters for authentication and sensitive flows
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isProd ? 20 : 500,
    message: { error: 'Too many authentication attempts. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

export const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isProd ? 10 : 200,
    message: { error: 'Too many OTP requests. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});
