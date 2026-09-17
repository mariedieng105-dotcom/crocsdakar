"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { CartItem } from "@/lib/cart-types";

const STORAGE_KEY = "crocsdakar_cart";

type CartContextValue = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clear: () => void;
  itemCount: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate client-only cart from localStorage once on mount
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // localStorage indisponible ou données corrompues, on repart d'un panier vide.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // stockage indisponible (mode privé, quota atteint...), on ignore silencieusement.
    }
  }, [items, hydrated]);

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.productId === newItem.productId && i.size === newItem.size
      );
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + newItem.quantity,
        };
        return next;
      }
      return [...prev, newItem];
    });
  };

  const removeItem = (productId: string, size: string) => {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.size === size)));
  };

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.productId === productId && i.size === size ? { ...i, quantity: Math.max(1, quantity) } : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const clear = () => setItems([]);

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.quantity * i.price, 0), [items]);

  const value: CartContextValue = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    itemCount,
    subtotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé à l'intérieur de <CartProvider>.");
  return ctx;
}
