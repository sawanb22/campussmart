import { useEffect, useState } from 'react';
import api from '@/api/client';
import { useWishlist } from '@/contexts/WishlistContext';

export interface DesignWishlistCard {
  title: string;
  image?: string;
}

const slugify = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * Lets a visitor "add to cart" a CMS design card (labs/libraries/sports-infra pages) that isn't
 * a purchasable product yet. Saved cards land in the same My Account > Wishlist as real products.
 */
export function useDesignWishlist(pageSlug: string) {
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set());
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const { refresh: refreshWishlistCount } = useWishlist();

  useEffect(() => {
    if (!localStorage.getItem('cm_token')) return;
    api.get('/wishlist')
      .then(({ data }) => {
        const items = Array.isArray(data) ? data : [];
        const keys = items
          .filter((item: { designKey?: string; pageSlug?: string }) => item.designKey && item.pageSlug === pageSlug)
          .map((item: { designKey: string }) => item.designKey);
        setSavedKeys(new Set(keys));
      })
      .catch(() => setSavedKeys(new Set()));
  }, [pageSlug]);

  const keyFor = (card: DesignWishlistCard) => `${pageSlug}:${slugify(card.title)}`;
  const isSaved = (card: DesignWishlistCard) => savedKeys.has(keyFor(card));
  const isPending = (card: DesignWishlistCard) => pendingKeys.has(keyFor(card));

  const setPending = (key: string, pending: boolean) => {
    setPendingKeys((previous) => {
      const next = new Set(previous);
      if (pending) next.add(key); else next.delete(key);
      return next;
    });
  };

  const add = async (card: DesignWishlistCard) => {
    const key = keyFor(card);
    if (savedKeys.has(key) || pendingKeys.has(key)) return;
    setPending(key, true);
    try {
      await api.post('/wishlist', { designKey: key, designTitle: card.title, designImage: card.image, pageSlug });
      setSavedKeys((previous) => new Set(previous).add(key));
      setActionMessage(`${card.title} added to wishlist.`);
      refreshWishlistCount();
    } catch (err: any) {
      if (err.response?.status === 401) setShowLoginPrompt(true);
      else setActionMessage('Failed to add to wishlist.');
    } finally {
      setPending(key, false);
    }
  };

  const remove = async (card: DesignWishlistCard) => {
    const key = keyFor(card);
    setPending(key, true);
    try {
      await api.delete(`/wishlist/design/${encodeURIComponent(key)}`);
      setSavedKeys((previous) => {
        const next = new Set(previous);
        next.delete(key);
        return next;
      });
      setActionMessage(`${card.title} removed from wishlist.`);
      refreshWishlistCount();
    } catch {
      setActionMessage('Failed to remove from wishlist.');
    } finally {
      setPending(key, false);
    }
  };

  return { isSaved, isPending, add, remove, showLoginPrompt, setShowLoginPrompt, actionMessage, setActionMessage };
}
