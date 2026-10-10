import { useEffect, useState } from 'react';
import api from '@/api/client';

// In-memory module-level cache for pageData to eliminate flicker on repeated navigation
const pageDataCache = new Map<string, any>();
const pageDataInflight = new Map<string, Promise<any | null>>();

// Module-level listener for cross-tab (BroadcastChannel) and active-tab (CustomEvent) cache invalidation
if (typeof window !== 'undefined') {
    const handleInvalidate = (data: any) => {
        if (data?.type === 'INVALIDATE_PAGE' && data?.slug) {
            clearPageDataCache(data.slug);
        } else if (data?.type === 'INVALIDATE_ALL') {
            clearPageDataCache();
        }
    };

    if (typeof BroadcastChannel !== 'undefined') {
        try {
            const globalChannel = new BroadcastChannel('cm_cms_channel');
            globalChannel.onmessage = (e) => handleInvalidate(e.data);
        } catch {
            // BroadcastChannel might not be supported in some environments
        }
    }

    try {
        window.addEventListener('cm_cms_channel', ((e: CustomEvent) => {
            handleInvalidate(e.detail);
        }) as EventListener);
    } catch {
        // Ignore CustomEvent errors
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
 * Broadcast CMS cache invalidation across all open browser tabs and the active window.
 */
export function broadcastCmsInvalidation(payload: { type: 'INVALIDATE_PAGE' | 'INVALIDATE_ALL'; slug?: string }) {
    if (typeof window !== 'undefined') {
        // Dispatch local window CustomEvent so active tab/window receives it immediately
        try {
            window.dispatchEvent(new CustomEvent('cm_cms_channel', { detail: payload }));
        } catch {
            // Ignore CustomEvent errors
        }

        if (typeof BroadcastChannel !== 'undefined') {
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

    // Cross-tab (BroadcastChannel) & Active-tab (CustomEvent) real-time sync
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleUpdate = (payload: any) => {
            if (payload?.type === 'INVALIDATE_PAGE' && payload?.slug === slug) {
                clearPageDataCache(slug);
                setVersion(v => v + 1);
            } else if (payload?.type === 'INVALIDATE_ALL') {
                clearPageDataCache();
                setVersion(v => v + 1);
            }
        };

        const onCustomEvent = ((e: CustomEvent) => {
            handleUpdate(e.detail);
        }) as EventListener;

        window.addEventListener('cm_cms_channel', onCustomEvent);

        let channel: BroadcastChannel | null = null;
        if (typeof BroadcastChannel !== 'undefined') {
            try {
                channel = new BroadcastChannel('cm_cms_channel');
                channel.onmessage = (e) => handleUpdate(e.data);
            } catch {
                // Ignore BroadcastChannel errors
            }
        }

        return () => {
            window.removeEventListener('cm_cms_channel', onCustomEvent);
            if (channel) {
                try {
                    channel.close();
                } catch {
                    // Ignore channel closure errors
                }
            }
        };
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

