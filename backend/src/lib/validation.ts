export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PINCODE_PATTERN = /^[1-9]\d{5}$/;

export const isValidEmail = (value: unknown): value is string =>
    typeof value === 'string' && EMAIL_PATTERN.test(value.trim());

export const normalizePhone = (phone: string): string =>
    phone.replace(/[^\d+]/g, '').trim();

export const isValidPhone = (value: unknown): value is string => {
    if (typeof value !== 'string') return false;
    const cleaned = normalizePhone(value);
    // Standard Indian number: 10 digits starting with 6-9, optional +91 or 0 prefix
    const indianPattern = /^(?:(?:\+91)|0)?[6-9]\d{9}$/;
    // International E.164 phone number: 7 to 15 digits, optional leading +
    const internationalPattern = /^\+?[1-9]\d{6,14}$/;
    return indianPattern.test(cleaned) || internationalPattern.test(cleaned);
};

export const isValidPincode = (value: unknown): value is string =>
    typeof value === 'string' && PINCODE_PATTERN.test(value.trim());
