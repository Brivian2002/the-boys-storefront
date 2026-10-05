"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Menu,
  X,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { CartBadge } from "@/components/cart/cart-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import {
  CATEGORY_LABELS,
  type Category,
} from "@/lib/blogger/types";

interface PublicHeaderProps {
  /** Announcement bar text. When empty the bar is hidden. */
  announcement?: string;
}

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?category=new-arrivals", label: "New Arrivals" },
  { href: "/delivery", label: "Delivery" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/policies", label: "Policies" },
  { href: "/contact", label: "Contact" },
];

const DEPARTMENTS: { category: Category; label: string; blurb: string }[] = [
  { category: "rings", label: "Rings", blurb: "Cowrie, bead & gold bands" },
  { category: "earrings", label: "Earrings", blurb: "Hoops, studs & drops" },
  { category: "necklaces", label: "Necklaces", blurb: "Beaded & cowrie chains" },
  { category: "bracelets", label: "Bracelets", blurb: "Bangles & cuffs" },
  { category: "watches", label: "Watches", blurb: "Afrocentric timepieces" },
  { category: "brooches", label: "Brooches", blurb: "Pins & Adinkra symbols" },
  { category: "sets", label: "Sets", blurb: "Coordinated bridal sets" },
];

export function PublicHeader({ announcement }: PublicHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim();
    if (q) {
      router.push(`/shop?q=${encodeURIComponent(q)}`);
      setSearchOpen(false);
      setMobileOpen(false);
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled ? "glass border-b border-border/60 shadow-sm" : "bg-background"
      )}
    >
      {/* announcement bar */}
      {announcement && (
        <div className="bg-foreground px-4 py-2 text-center text-[0.7rem] tracking-wide text-background sm:text-xs">
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-gold" />
            {announcement}
          </span>
        </div>
      )}

      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        {/* mobile menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[320px] p-0 sm:w-[380px]">
            <SheetHeader className="border-b p-4">
              <SheetTitle asChild>
                <Link href="/" onClick={() => setMobileOpen(false)}>
                  <BrandLogo />
                </Link>
              </SheetTitle>
            </SheetHeader>
            <div className="space-y-1 p-4">
              <form onSubmit={submitSearch} className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search products..."
                    className="pl-9"
                  />
                </div>
              </form>
              <p className="px-3 pb-1 pt-2 text-xs uppercase tracking-wider text-muted-foreground">
                Departments
              </p>
              {DEPARTMENTS.map((d) => (
                <SheetClose asChild key={d.category}>
                  <Link
                    href={`/shop?category=${d.category}`}
                    className="block rounded-md px-3 py-2.5 transition-colors hover:bg-muted"
                  >
                    <span className="block font-medium">{d.label}</span>
                    <span className="text-xs text-muted-foreground">{d.blurb}</span>
                  </Link>
                </SheetClose>
              ))}
              <div className="my-3 h-px bg-border" />
              {NAV_LINKS.map((l) => (
                <SheetClose asChild key={l.href}>
                  <Link
                    href={l.href}
                    className={cn(
                      "block rounded-md px-3 py-2.5 font-medium transition-colors hover:bg-muted",
                      pathname === l.href.split("?")[0] && "text-turquoise"
                    )}
                  >
                    {l.label}
                  </Link>
                </SheetClose>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        {/* logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center"
          aria-label="The Boys Store home"
        >
          <BrandLogo />
        </Link>

        {/* desktop nav */}
        <NavigationMenu className="ml-6 hidden lg:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent data-[state=open]:bg-muted">
                Departments
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[520px] gap-1 p-3 md:grid-cols-2">
                  {DEPARTMENTS.map((d) => (
                    <li key={d.category}>
                      <NavigationMenuLink asChild>
                        <Link
                          href={`/shop?category=${d.category}`}
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-muted"
                        >
                          <div className="text-sm font-medium leading-none">
                            {d.label}
                          </div>
                          <div className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                            {d.blurb}
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            {NAV_LINKS.map((l) => (
              <NavigationMenuItem key={l.href}>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link href={l.href}>{l.label}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="ml-auto flex items-center gap-1">
          {/* search (desktop) */}
          <div className="hidden md:block">
            {searchOpen ? (
              <form onSubmit={submitSearch} className="relative">
                <Input
                  autoFocus
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onBlur={() => !searchValue && setSearchOpen(false)}
                  placeholder="Search products..."
                  className="w-48 pr-8 lg:w-64"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchValue("");
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Close search"
                >
                  <X className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                className="h-9 w-9"
                aria-label="Search"
              >
                <Search className="h-[1.15rem] w-[1.15rem]" />
              </Button>
            )}
          </div>
          {/* search (mobile) */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 md:hidden"
            onClick={() => {
              const q = window.prompt("Search products:");
              if (q && q.trim()) router.push(`/shop?q=${encodeURIComponent(q.trim())}`);
            }}
            aria-label="Search"
          >
            <Search className="h-[1.15rem] w-[1.15rem]" />
          </Button>

          <ThemeToggle />
          <CartBadge />
        </div>
      </div>
    </header>
  );
}

export { CATEGORY_LABELS };
