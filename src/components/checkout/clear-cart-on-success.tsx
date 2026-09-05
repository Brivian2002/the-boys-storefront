"use client";

import * as React from "react";
import { useCart } from "@/stores/cart";

/**
 * Clears the cart on mount. Used on the verify-success page so the bag is
 * emptied once payment has been confirmed. Renders nothing.
 */
export function ClearCartOnSuccess() {
  const clear = useCart((s) => s.clear);
  React.useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
