/**
 * Cart store - client-side, persisted to localStorage.
 *
 * The browser cart only ever stores product IDs, quantities, and selected
 * attribute values. Prices are NEVER trusted from the browser - the server
 * recomputes totals at checkout using authoritative Blogger data.
 */

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  image: string;
  /** major-unit price snapshot for display only */
  unitPrice: number;
  currency: "GHS" | "USD";
  quantity: number;
  /** selected custom attributes, e.g. { "Ring Size": "7" } */
  attributes: Record<string, string>;
}

interface CartState {
  lines: CartLine[];
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  remove: (productId: string, attributes: Record<string, string>) => void;
  setQuantity: (productId: string, attributes: Record<string, string>, qty: number) => void;
  clear: () => void;
  count: () => number;
  /** display-only subtotal; server recomputes authoritative total */
  subtotal: () => number;
}

function lineKey(productId: string, attributes: Record<string, string>) {
  const attrSig = Object.keys(attributes)
    .sort()
    .map((k) => `${k}:${attributes[k]}`)
    .join("|");
  return `${productId}::${attrSig}`;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (line, quantity = 1) => {
        const key = lineKey(line.productId, line.attributes);
        set((state) => {
          const existing = state.lines.find((l) => lineKey(l.productId, l.attributes) === key);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                lineKey(l.productId, l.attributes) === key
                  ? { ...l, quantity: l.quantity + quantity }
                  : l
              ),
            };
          }
          return { lines: [...state.lines, { ...line, quantity }] };
        });
      },
      remove: (productId, attributes) => {
        const key = lineKey(productId, attributes);
        set((state) => ({
          lines: state.lines.filter((l) => lineKey(l.productId, l.attributes) !== key),
        }));
      },
      setQuantity: (productId, attributes, qty) => {
        const key = lineKey(productId, attributes);
        set((state) => ({
          lines: state.lines
            .map((l) =>
              lineKey(l.productId, l.attributes) === key
                ? { ...l, quantity: Math.max(1, qty) }
                : l
            )
            .filter((l) => l.quantity > 0),
        }));
      },
      clear: () => set({ lines: [] }),
      count: () => get().lines.reduce((sum, l) => sum + l.quantity, 0),
      subtotal: () => get().lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0),
    }),
    {
      name: "la-glitz-cart",
      version: 1,
    }
  )
);
