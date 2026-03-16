import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Artwork } from '../types';

interface WishlistContextType {
  items: Artwork[];
  toggle: (artwork: Artwork) => void;
  isWishlisted: (artworkId: string) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | null>(null);
const SESSION_KEY = 'shilposhop_wishlist';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Artwork[]>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  const toggle = useCallback((artwork: Artwork) => {
    setItems(prev =>
      prev.some(i => i.id === artwork.id) ? prev.filter(i => i.id !== artwork.id) : [...prev, artwork]
    );
  }, []);

  const isWishlisted = useCallback((id: string) => items.some(i => i.id === id), [items]);

  return (
    <WishlistContext.Provider value={{ items, toggle, isWishlisted, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
