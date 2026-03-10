import React, { createContext, useContext, useState, useCallback } from 'react';
import { Artwork } from '../types';

export interface CartItem {
  artwork: Artwork;
  quantity: number;
}

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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = useCallback((artwork: Artwork, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.artwork.id === artwork.id);
      if (existing) {
        return prev.map(i =>
          i.artwork.id === artwork.id
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }
      return [...prev, { artwork, quantity: qty }];
    });
  }, []);

  const removeFromCart = useCallback((artworkId: string) => {
    setItems(prev => prev.filter(i => i.artwork.id !== artworkId));
  }, []);

  const updateQuantity = useCallback((artworkId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.artwork.id !== artworkId));
    } else {
      setItems(prev =>
        prev.map(i =>
          i.artwork.id === artworkId ? { ...i, quantity } : i
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.artwork.price * i.quantity, 0);
  const isInCart = useCallback((artworkId: string) => items.some(i => i.artwork.id === artworkId), [items]);

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, updateQuantity,
      clearCart, totalItems, totalPrice, isInCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
