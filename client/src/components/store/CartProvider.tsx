import type { CatalogProduct } from "@shared/catalog";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type CartLine = Pick<CatalogProduct, "id" | "name" | "price" | "currency" | "slug" | "images"> & { quantity: number };
type CartContextValue = {
  items: CartLine[];
  itemCount: number;
  addItem: (product: CatalogProduct) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "la-glitz-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored) as CartLine[]);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    addItem(product) {
      setItems(current => {
        const existing = current.find(item => item.id === product.id);
        if (existing) return current.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
        return [...current, {
          id: product.id,
          name: product.name,
          price: product.price,
          currency: product.currency,
          slug: product.slug,
          images: product.images,
          quantity: 1,
        }];
      });
    },
    updateQuantity(id, quantity) {
      setItems(current => quantity <= 0 ? current.filter(item => item.id !== id) : current.map(item => item.id === id ? { ...item, quantity } : item));
    },
    removeItem(id) {
      setItems(current => current.filter(item => item.id !== id));
    },
    clearCart() {
      setItems([]);
    },
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
