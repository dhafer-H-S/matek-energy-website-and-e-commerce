"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { effectivePrice } from "@/lib/money";

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  unitPrice: number;
  currency: "TRY" | "EUR";
  quantity: number;
}

interface CartContextValue {
  lines: CartLine[];
  count: number;
  totals: { TRY: number; EUR: number };
  ready: boolean;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const KEY = "matek_cart_v1";

export function lineFromProduct(p: {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  price: number;
  salePrice: number | null;
  currency: "TRY" | "EUR";
}): Omit<CartLine, "quantity"> {
  return {
    productId: p.id,
    slug: p.slug,
    name: p.name,
    image: p.image,
    unitPrice: effectivePrice(p),
    currency: p.currency,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, ready]);

  const add = useCallback<CartContextValue["add"]>((line, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === line.productId);
      if (existing) {
        return prev.map((l) =>
          l.productId === line.productId
            ? { ...l, ...line, quantity: Math.min(999, l.quantity + quantity) }
            : l,
        );
      }
      return [...prev, { ...line, quantity }];
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setLines((prev) =>
      prev.map((l) =>
        l.productId === productId
          ? { ...l, quantity: Math.max(1, Math.min(999, quantity)) }
          : l,
      ),
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const totals = { TRY: 0, EUR: 0 };
    let count = 0;
    for (const l of lines) {
      totals[l.currency] += l.unitPrice * l.quantity;
      count += l.quantity;
    }
    return { lines, count, totals, ready, add, setQuantity, remove, clear };
  }, [lines, ready, add, setQuantity, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
