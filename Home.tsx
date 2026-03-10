import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Artwork } from '../types';

export interface CartItem { artwork: Artwork; quantity: number; }

interface CartContextType {
  items: CartItem[];
  addToCart: (artwork: Artwork, qty?: number) => void;
  removeFromCart: (artworkId: string) => void;
  updateQuantity: (artworkId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isInCart: (artworkId: string) => boolean;
}

const CartContext = createContext<CartContextType | null>(null);
const SESSION_KEY = 'shilposhop_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  const addToCart = useCallback((artwork: Artwork, qty = 1) => {
    setItems(prev => {
      const ex = prev.find(i => i.artwork.id === artwork.id);
      if (ex) return prev.map(i => i.artwork.id === artwork.id ? { ...i, quantity: i.quantity + qty } : i);
      return [...prev, { artwork, quantity: qty }];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => setItems(prev => prev.filter(i => i.artwork.id !== id)), []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) setItems(prev => prev.filter(i => i.artwork.id !== id));
    else setItems(prev => prev.map(i => i.artwork.id === id ? { ...i, quantity } : i));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.artwork.price * i.quantity, 0);
  const isInCart = useCallback((id: string) => items.some(i => i.artwork.id === id), [items]);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice, isInCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
