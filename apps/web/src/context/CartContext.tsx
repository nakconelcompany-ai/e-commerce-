'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  variantId: string;
  productId: string;
  productTitle: string;
  variantTitle: string;
  priceMinor: number;
  image?: string;
  quantity: number;
  sellerId: string;
  sellerName: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  totalMinor: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalMinor: 0,
  totalItems: 0,
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('nuvora_cart');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem('nuvora_cart', JSON.stringify(newItems));
  };

  const addItem = (newItem: CartItem) => {
    const existing = items.findIndex((i) => i.variantId === newItem.variantId);
    if (existing > -1) {
      const updated = [...items];
      updated[existing].quantity += newItem.quantity;
      saveCart(updated);
    } else {
      saveCart([...items, newItem]);
    }
  };

  const removeItem = (variantId: string) => {
    saveCart(items.filter((i) => i.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId);
    } else {
      saveCart(items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)));
    }
  };

  const clearCart = () => {
    saveCart([]);
  };

  const totalMinor = items.reduce((sum, item) => sum + item.priceMinor * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalMinor, totalItems }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
