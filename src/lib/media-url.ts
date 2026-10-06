export function resolveMediaUrl(value?: string | null): string {
    if (!value) return '';
    if (/^(https?:|data:|blob:)/i.test(value)) return value;

    const cleanPath = value.startsWith('/') ? value : `/${value}`;

    // Static uploads are bundled into public/uploads and served directly by Vercel CDN / Vite
    if (cleanPath.startsWith('/uploads/')) {
        return cleanPath;
    }

    const base = import.meta.env.VITE_API_URL || '/api';
    const origin = base.startsWith('http')
        ? new URL(base).origin
        : (typeof window !== 'undefined' && window.location?.origin ? window.location.origin : '');

    if (!origin) return cleanPath;
    return new URL(cleanPath, `${origin}/`).toString();
}