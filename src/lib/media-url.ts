export function resolveMediaUrl(value?: string | null): string {
    if (!value) return '';
    if (/^(https?:|data:|blob:)/i.test(value)) return value;

    const base = import.meta.env.VITE_API_URL || 'https://api.campusmart.in/api';
    const origin = base.startsWith('http')
        ? new URL(base).origin
        : (typeof window !== 'undefined' && window.location?.origin ? window.location.origin : '');

    const cleanPath = value.startsWith('/') ? value : `/${value}`;
    if (!origin) return cleanPath;
    return new URL(cleanPath, `${origin}/`).toString();
}