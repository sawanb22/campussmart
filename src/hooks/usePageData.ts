import { useEffect, useState } from 'react';
import api from '@/api/client';

// In-memory module-level cache for pageData to eliminate flicker on repeated navigation
const pageDataCache = new Map<string, any>();
const pageDataInflight = new Map<string, Promise<any>>();

/**
 * Clear the page data cache. Call this after CMS updates.
 */
export function clearPageDataCache(slug?: string) {
    if (slug) {
        pageDataCache.delete(slug);
        pageDataInflight.delete(slug);
    } else {
        pageDataCache.clear();
        pageDataInflight.clear();
    }
}

/**
 * Hook that fetches `pageData` JSON for a given slug.
 * Employs in-memory caching and request deduplication to prevent layout jumps/flicker.
 * Returns an empty object while loading or on error.
 * Components use this with a default fallback pattern:
 *   data.heroTitle ?? 'Hardcoded default'
 */
export function usePageData<T = Record<string, any>>(slug: string): {
    data: T;
    loading: boolean;
} {
    const cached = pageDataCache.get(slug);
    const [data, setData] = useState<T>((cached || {}) as T);
    const [loading, setLoading] = useState(!cached);

    useEffect(() => {
        let alive = true;

        if (pageDataCache.has(slug)) {
            const currentCache = pageDataCache.get(slug);
            setData(currentCache);
            setLoading(false);
        }

        let fetchPromise = pageDataInflight.get(slug);
        if (!fetchPromise) {
            fetchPromise = api.get(`/pages/${slug}`)
                .then(res => {
                    try {
                        return res.data.pageData ? JSON.parse(res.data.pageData) : {};
                    } catch {
                        return {};
                    }
                })
                .catch(() => ({}))
                .finally(() => {
                    pageDataInflight.delete(slug);
                });
            pageDataInflight.set(slug, fetchPromise);
        }

        fetchPromise.then(parsed => {
            if (!alive) return;
            pageDataCache.set(slug, parsed);
            setData(prev => {
                // Prevent state mutation and re-render if data is identical
                if (JSON.stringify(prev) === JSON.stringify(parsed)) {
                    return prev;
                }
                return parsed as T;
            });
            setLoading(false);
        });

        return () => { alive = false; };
    }, [slug]);

    return { data, loading };
}

