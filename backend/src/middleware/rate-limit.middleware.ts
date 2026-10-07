import rateLimit from 'express-rate-limit';

// Global rate limiting
export const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });

// Dedicated rate limiters for authentication and sensitive flows
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Too many authentication attempts. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

export const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many OTP requests. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});
