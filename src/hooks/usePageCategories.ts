import { useEffect, useState } from 'react';
import api from '@/api/client';

export interface PageCategory {
    id: number;
    name: string;
    slug: string;
    page: string;
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
    const [categories, setCategories] = useState<PageCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;
        api.get('/products/categories', { params: { page } })
            .then(res => { if (alive) setCategories(Array.isArray(res.data) ? res.data : []); })
            .catch(() => { if (alive) setCategories([]); })
            .finally(() => { if (alive) setLoading(false); });
        return () => { alive = false; };
    }, [page]);

    return { categories, loading };
}
