import { useEffect, useState } from 'react';
import api from '@/api/client';

export interface PageCategory {
    id: number;
    name: string;
    slug: string;
    page: string;
}

const pageCategoriesCache = new Map<string, PageCategory[]>();
const pageCategoriesInflight = new Map<string, Promise<PageCategory[]>>();

export function clearPageCategoriesCache(page?: string) {
    if (page) {
        pageCategoriesCache.delete(page);
        pageCategoriesInflight.delete(page);
    } else {
        pageCategoriesCache.clear();
        pageCategoriesInflight.clear();
    }
}

/**
 * Hook that fetches the admin-managed product categories assigned to a page
 * (the "Show Category On" value in Admin > Categories).
 * Returns an empty list while loading or on error.
 */
export function usePageCategories(page: string): {
    categories: PageCategory[];
    loading: boolean;
} {
    const cached = pageCategoriesCache.get(page);
    const [categories, setCategories] = useState<PageCategory[]>(cached || []);
    const [loading, setLoading] = useState(!cached);

    useEffect(() => {
        let alive = true;

        if (pageCategoriesCache.has(page)) {
            setCategories(pageCategoriesCache.get(page)!);
            setLoading(false);
        }

        let fetchPromise = pageCategoriesInflight.get(page);
        if (!fetchPromise) {
            fetchPromise = api.get('/products/categories', { params: { page } })
                .then(res => (Array.isArray(res.data) ? res.data : []))
                .catch(() => [])
                .finally(() => {
                    pageCategoriesInflight.delete(page);
                });
            pageCategoriesInflight.set(page, fetchPromise);
        }

        fetchPromise.then(resCategories => {
            if (!alive) return;
            pageCategoriesCache.set(page, resCategories);
            setCategories(prev => {
                if (JSON.stringify(prev) === JSON.stringify(resCategories)) {
                    return prev;
                }
                return resCategories;
            });
            setLoading(false);
        });

        return () => { alive = false; };
    }, [page]);

    return { categories, loading };
}

