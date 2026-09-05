/**
 * Cart badge - shows item count in the header.
 */
"use client";

import * as React from "react";
import { ShoppingBag } from "lucide-react";
import { useCart, useCartHydrated } from "@/components/cart/cart-provider";
import { useCart as useCartStore } from "@/stores/cart";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function CartBadge() {
  const hydrated = useCartHydrated();
  const count = useCartStore((s) => s.count());
  return (
    <Link
      href="/cart"
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
      aria-label={`Shopping bag, ${count} items`}
    >
      <ShoppingBag className="h-[1.15rem] w-[1.15rem]" />
      {hydrated && count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.6rem] font-bold text-primary-foreground">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
