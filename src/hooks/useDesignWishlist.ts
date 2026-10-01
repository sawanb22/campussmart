import { useState, useCallback } from 'react';
import { useWishlist } from '@/contexts/WishlistContext';

export interface DesignWishlistCard {
  title: string;
  image?: string;
}

const slugify = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * Lets a visitor wishlist a CMS design card (labs/libraries/sports-infra pages) that isn't
 * a purchasable product yet. Saved cards land in the same My Account > Wishlist as real products.
 */
export function useDesignWishlist(pageSlug: string) {
  const { isDesignInWishlist, addDesign, removeDesign } = useWishlist();
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set());
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const keyFor = useCallback((card: DesignWishlistCard) => `${pageSlug}:${slugify(card.title)}`, [pageSlug]);
  const isSaved = useCallback((card: DesignWishlistCard) => isDesignInWishlist(keyFor(card)), [isDesignInWishlist, keyFor]);
  const isPending = useCallback((card: DesignWishlistCard) => pendingKeys.has(keyFor(card)), [pendingKeys, keyFor]);

  const add = async (card: DesignWishlistCard) => {
    const key = keyFor(card);
    if (pendingKeys.has(key)) return;
    setPendingKeys((prev) => new Set(prev).add(key));
    try {
      const res = await addDesign(card, pageSlug);
      if (res.unauthenticated) {
        setShowLoginPrompt(true);
      } else if (res.success) {
        setActionMessage(`${card.title} added to wishlist.`);
      } else {
        setActionMessage(res.error || 'Failed to add to wishlist.');
      }
    } finally {
      setPendingKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const remove = async (card: DesignWishlistCard) => {
    const key = keyFor(card);
    if (pendingKeys.has(key)) return;
    setPendingKeys((prev) => new Set(prev).add(key));
    try {
      const res = await removeDesign(key);
      if (res.success) {
        setActionMessage(`${card.title} removed from wishlist.`);
      } else {
        setActionMessage(res.error || 'Failed to remove from wishlist.');
      }
    } finally {
      setPendingKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  return { isSaved, isPending, add, remove, showLoginPrompt, setShowLoginPrompt, actionMessage, setActionMessage };
}
