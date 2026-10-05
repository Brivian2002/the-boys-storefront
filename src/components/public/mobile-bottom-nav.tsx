"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Search, ShoppingBag } from "lucide-react";
import { useCartHydrated } from "@/components/cart/cart-provider";
import { useCart } from "@/stores/cart";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/shop", label: "Categories", icon: LayoutGrid },
  { href: "/shop", label: "Search", icon: Search },
  { href: "/cart", label: "Cart", icon: ShoppingBag },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const hydrated = useCartHydrated();
  const count = useCart((state) => state.count());

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden" aria-label="Mobile shopping navigation">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link key={label} href={href} className={cn("relative flex min-h-14 flex-col items-center justify-center gap-1 text-[0.65rem] font-medium transition-colors", active ? "text-blue-600" : "text-muted-foreground hover:text-foreground")}>
              <Icon className="h-5 w-5" />
              {label}
              {label === "Cart" && hydrated && count > 0 && <span className="absolute left-1/2 top-1 flex h-4 min-w-4 -translate-x-0.5 items-center justify-center rounded-full bg-blue-600 px-1 text-[0.55rem] font-bold text-white">{count > 99 ? "99+" : count}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
