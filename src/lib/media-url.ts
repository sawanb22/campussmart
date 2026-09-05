const API_BASE = import.meta.env.VITE_API_URL || 'https://api.campusmart.in/api';

export function resolveMediaUrl(value?: string | null): string {
    if (!value) return '';
    if (/^(https?:|data:|blob:)/i.test(value)) return value;

    const apiOrigin = new URL(API_BASE).origin;

    return new URL(value, `${apiOrigin}/`).toString();
}