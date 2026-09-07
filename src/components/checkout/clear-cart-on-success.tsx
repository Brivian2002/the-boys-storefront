"use client";

import * as React from "react";
import { useCart } from "@/stores/cart";
import { useCartHydrated } from "@/components/cart/cart-provider";

/**
 * Clears the cart on the checkout success page.
 * Renders nothing.
 */
export function ClearCartOnSuccess() {
  const hydrated = useCartHydrated();
  const clear = useCart((s) => s.clear);
  const clearedRef = React.useRef(false);

  React.useEffect(() => {
    if (!hydrated) return;
    if (clearedRef.current) return;
    clearedRef.current = true;
    clear();
  }, [hydrated, clear]);

  return null;
}
