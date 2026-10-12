export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_PATTERN = /^(?:\+?91)?0?\d{10}$/;
export const PINCODE_PATTERN = /^[1-9]\d{5}$/;

export const isValidEmail = (value: unknown): value is string =>
    typeof value === 'string' && EMAIL_PATTERN.test(value.trim());

export const isValidPhone = (value: unknown): value is string => {
    if (typeof value !== 'string') return false;
    const cleaned = value.replace(/[()\s\-+]/g, '');
    return /^\d{7,15}$/.test(cleaned);
};

export const isValidPincode = (value: unknown): value is string =>
    typeof value === 'string' && PINCODE_PATTERN.test(value.trim());
