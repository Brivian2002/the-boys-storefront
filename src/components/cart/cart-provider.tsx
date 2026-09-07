"use client";

import * as React from "react";
import { useCart } from "@/stores/cart";

/**
 * Cart provider - keeps cart hydrated on first client render
 * and exposes a context-free hook via the store.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => {
    setHydrated(true);
  }, []);
  return <CartContext.Provider value={{ hydrated }}>{children}</CartContext.Provider>;
}

const CartContext = React.createContext<{ hydrated: boolean }>({ hydrated: false });

export function useCartHydrated() {
  return React.useContext(CartContext).hydrated;
}
