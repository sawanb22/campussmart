import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import api from '@/api/client';

interface WishlistContextValue {
  count: number;
  refresh: () => void;
}

const WishlistContext = createContext<WishlistContextValue>({ count: 0, refresh: () => {} });

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(() => {
    if (!localStorage.getItem('cm_token')) {
      setCount(0);
      return;
    }
    api.get('/wishlist')
      .then(({ data }) => setCount(Array.isArray(data) ? data.length : 0))
      .catch(() => setCount(0));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return <WishlistContext.Provider value={{ count, refresh }}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  return useContext(WishlistContext);
}
