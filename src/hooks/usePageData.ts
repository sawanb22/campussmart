import { useEffect, useState } from 'react';
import api from '@/api/client';

// In-memory module-level cache for pageData to eliminate flicker on repeated navigation
const pageDataCache = new Map<string, any>();
const pageDataInflight = new Map<string, Promise<any | null>>();

// Module-level BroadcastChannel listener for cross-tab cache invalidation
if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
    try {
        const globalChannel = new BroadcastChannel('cm_cms_channel');
        globalChannel.onmessage = (e) => {
            if (e.data?.type === 'INVALIDATE_PAGE' && e.data?.slug) {
                clearPageDataCache(e.data.slug);
            } else if (e.data?.type === 'INVALIDATE_ALL') {
                clearPageDataCache();
            }
        };
    } catch {
        // BroadcastChannel might not be supported in some environments
    }
}

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
 * Broadcast CMS cache invalidation across all open browser tabs.
 */
export function broadcastCmsInvalidation(payload: { type: 'INVALIDATE_PAGE' | 'INVALIDATE_ALL'; slug?: string }) {
    if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
        try {
            const channel = new BroadcastChannel('cm_cms_channel');
            channel.postMessage(payload);
            setTimeout(() => {
                try {
                    channel.close();
                } catch {
                    // Ignore channel closure errors
                }
            }, 200);
        } catch {
            // Ignore BroadcastChannel errors
        }
    }
}

/**
 * Hook that fetches `pageData` JSON for a given slug.
 * Employs in-memory caching and request deduplication to prevent layout jumps/flicker.
 * Retains existing state on error (never poisons cache with {}).
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
    const [version, setVersion] = useState(0);

    // Cross-tab real-time sync via BroadcastChannel
    useEffect(() => {
        if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
            try {
                const channel = new BroadcastChannel('cm_cms_channel');
                channel.onmessage = (e) => {
                    if (e.data?.type === 'INVALIDATE_PAGE' && e.data?.slug === slug) {
                        clearPageDataCache(slug);
                        setVersion(v => v + 1);
                    } else if (e.data?.type === 'INVALIDATE_ALL') {
                        clearPageDataCache();
                        setVersion(v => v + 1);
                    }
                };
                return () => {
                    channel.close();
                };
            } catch {
                // Ignore BroadcastChannel errors
            }
        }
    }, [slug]);

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
                .catch((err) => {
                    console.warn(`[usePageData] Failed to fetch pageData for slug "${slug}". Retaining existing state.`, err);
                    return null;
                })
                .finally(() => {
                    pageDataInflight.delete(slug);
                });
            pageDataInflight.set(slug, fetchPromise);
        }

        fetchPromise.then(parsed => {
            if (!alive) return;
            if (parsed !== null) {
                pageDataCache.set(slug, parsed);
                setData(prev => {
                    // Prevent state mutation and re-render if data is identical
                    if (JSON.stringify(prev) === JSON.stringify(parsed)) {
                        return prev;
                    }
                    return parsed as T;
                });
            }
            setLoading(false);
        });

        return () => { alive = false; };
    }, [slug, version]);

    return { data, loading };
}

