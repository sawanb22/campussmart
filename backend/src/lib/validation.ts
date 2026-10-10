export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_PATTERN = /^(?:\+91[ -]?)?[6-9]\d{9}$/;
export const PINCODE_PATTERN = /^[1-9]\d{5}$/;

export const isValidEmail = (value: unknown): value is string =>
    typeof value === 'string' && EMAIL_PATTERN.test(value.trim());

export const isValidPhone = (value: unknown): value is string =>
    typeof value === 'string' && PHONE_PATTERN.test(value.replace(/[()\s-]/g, ''));

export const isValidPincode = (value: unknown): value is string =>
    typeof value === 'string' && PINCODE_PATTERN.test(value.trim());
