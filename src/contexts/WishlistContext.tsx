import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import api from '@/api/client';
import { getUserToken, isUserLoggedIn } from '@/lib/auth-session';

export interface WishlistProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  sku?: string | null;
  imageUrl?: string | null;
  category?: { name: string; slug: string } | null;
}

export interface WishlistItem {
  id: number;
  productId?: number | null;
  product?: WishlistProduct | null;
  designKey?: string | null;
  designTitle?: string | null;
  designImage?: string | null;
  pageSlug?: string | null;
  createdAt?: string;
}

interface WishlistContextValue {
  items: WishlistItem[];
  productIds: Set<number>;
  designKeys: Set<string>;
  count: number;
  loading: boolean;
  isInWishlist: (productId: number) => boolean;
  isDesignInWishlist: (designKey: string) => boolean;
  addProduct: (productId: number) => Promise<{ success: boolean; unauthenticated?: boolean; error?: string }>;
  removeProduct: (productId: number) => Promise<{ success: boolean; error?: string }>;
  toggleProduct: (productId: number) => Promise<{ added: boolean; success: boolean; unauthenticated?: boolean }>;
  addDesign: (card: { title: string; image?: string }, pageSlug: string) => Promise<{ success: boolean; unauthenticated?: boolean; error?: string }>;
  removeDesign: (designKey: string) => Promise<{ success: boolean; error?: string }>;
  refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue>({
  items: [],
  productIds: new Set(),
  designKeys: new Set(),
  count: 0,
  loading: false,
  isInWishlist: () => false,
  isDesignInWishlist: () => false,
  addProduct: async () => ({ success: false }),
  removeProduct: async () => ({ success: false }),
  toggleProduct: async () => ({ added: false, success: false }),
  addDesign: async () => ({ success: false }),
  removeDesign: async () => ({ success: false }),
  refresh: async () => {},
});

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isUserLoggedIn() || !getUserToken()) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get('/wishlist');
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const productIds = useMemo(() => {
    const ids = new Set<number>();
    items.forEach((item) => {
      const pid = item.productId || item.product?.id;
      if (pid) ids.add(pid);
    });
    return ids;
  }, [items]);

  const designKeys = useMemo(() => {
    const keys = new Set<string>();
    items.forEach((item) => {
      if (item.designKey) keys.add(item.designKey);
    });
    return keys;
  }, [items]);

  const isInWishlist = useCallback((productId: number) => productIds.has(productId), [productIds]);
  const isDesignInWishlist = useCallback((designKey: string) => designKeys.has(designKey), [designKeys]);

  const addProduct = useCallback(async (productId: number) => {
    if (!isUserLoggedIn() || !getUserToken()) {
      return { success: false, unauthenticated: true, error: 'Please login to add to wishlist' };
    }
    try {
      const { data } = await api.post('/wishlist', { productId });
      setItems((prev) => {
        const exists = prev.some((i) => (i.productId || i.product?.id) === productId);
        return exists ? prev : [data, ...prev];
      });
      return { success: true };
    } catch (err: any) {
      if (err.response?.status === 401) {
        return { success: false, unauthenticated: true, error: 'Please login to add to wishlist' };
      }
      return { success: false, error: err.response?.data?.error || 'Failed to add to wishlist' };
    }
  }, []);

  const removeProduct = useCallback(async (productId: number) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      setItems((prev) => prev.filter((i) => (i.productId || i.product?.id) !== productId));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || 'Failed to remove from wishlist' };
    }
  }, []);

  const toggleProduct = useCallback(async (productId: number) => {
    if (productIds.has(productId)) {
      const res = await removeProduct(productId);
      return { added: false, success: res.success };
    } else {
      const res = await addProduct(productId);
      return { added: true, success: res.success, unauthenticated: res.unauthenticated };
    }
  }, [productIds, addProduct, removeProduct]);

  const addDesign = useCallback(async (card: { title: string; image?: string }, pageSlug: string) => {
    if (!isUserLoggedIn() || !getUserToken()) {
      return { success: false, unauthenticated: true, error: 'Please login to add to wishlist' };
    }
    const slugifiedTitle = card.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const designKey = `${pageSlug}:${slugifiedTitle}`;
    try {
      const { data } = await api.post('/wishlist', {
        designKey,
        designTitle: card.title,
        designImage: card.image,
        pageSlug,
      });
      setItems((prev) => {
        const exists = prev.some((i) => i.designKey === designKey);
        return exists ? prev : [data, ...prev];
      });
      return { success: true };
    } catch (err: any) {
      if (err.response?.status === 401) {
        return { success: false, unauthenticated: true, error: 'Please login to add to wishlist' };
      }
      return { success: false, error: err.response?.data?.error || 'Failed to add to wishlist' };
    }
  }, []);

  const removeDesign = useCallback(async (designKey: string) => {
    try {
      await api.delete(`/wishlist/design/${encodeURIComponent(designKey)}`);
      setItems((prev) => prev.filter((i) => i.designKey !== designKey));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || 'Failed to remove from wishlist' };
    }
  }, []);

  const value = useMemo(() => ({
    items,
    productIds,
    designKeys,
    count: items.length,
    loading,
    isInWishlist,
    isDesignInWishlist,
    addProduct,
    removeProduct,
    toggleProduct,
    addDesign,
    removeDesign,
    refresh,
  }), [items, productIds, designKeys, loading, isInWishlist, isDesignInWishlist, addProduct, removeProduct, toggleProduct, addDesign, removeDesign, refresh]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  return useContext(WishlistContext);
}
