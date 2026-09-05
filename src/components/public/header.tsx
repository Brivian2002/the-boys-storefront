"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Menu,
  X,
  ChevronDown,
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

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?category=new-arrivals", label: "New Arrivals" },
  { href: "/delivery", label: "Delivery" },
  { href: "/about", label: "About" },
  { href: "/policies", label: "Policies" },
  { href: "/contact", label: "Contact" },
];

const DEPARTMENTS: { category: Category; label: string; blurb: string }[] = [
  { category: "rings", label: "Rings", blurb: "Engagement, wedding & statement" },
  { category: "earrings", label: "Earrings", blurb: "Hoops, studs & drops" },
  { category: "necklaces", label: "Necklaces", blurb: "Chains & pendants" },
  { category: "bracelets", label: "Bracelets", blurb: "Bangles & cuffs" },
  { category: "sets", label: "Sets", blurb: "Coordinated bridal sets" },
];

export function PublicHeader() {
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
      window.location.assign(`/shop?q=${encodeURIComponent(q)}`);
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
      <div className="bg-foreground text-background text-center text-[0.7rem] sm:text-xs py-2 px-4 tracking-wide">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-gold" />
          Handcrafted in Accra · Delivered across Ghana with care
        </span>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        {/* mobile menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[320px] sm:w-[380px] p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle asChild>
                <Link href="/" onClick={() => setMobileOpen(false)}>
                  <BrandLogo />
                </Link>
              </SheetTitle>
            </SheetHeader>
            <div className="p-4 space-y-1">
              <form onSubmit={submitSearch} className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search jewelry..."
                    className="pl-9"
                  />
                </div>
              </form>
              <p className="text-xs uppercase tracking-wider text-muted-foreground px-3 pt-2 pb-1">
                Departments
              </p>
              {DEPARTMENTS.map((d) => (
                <SheetClose asChild key={d.category}>
                  <Link
                    href={`/shop?category=${d.category}`}
                    className="block px-3 py-2.5 rounded-md hover:bg-muted transition-colors"
                  >
                    <span className="font-medium block">{d.label}</span>
                    <span className="text-xs text-muted-foreground">{d.blurb}</span>
                  </Link>
                </SheetClose>
              ))}
              <div className="h-px bg-border my-3" />
              {NAV_LINKS.map((l) => (
                <SheetClose asChild key={l.href}>
                  <Link
                    href={l.href}
                    className="block px-3 py-2.5 rounded-md hover:bg-muted transition-colors font-medium"
                  >
                    {l.label}
                  </Link>
                </SheetClose>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        {/* logo */}
        <Link href="/" className="flex items-center shrink-0" aria-label="LA GLITZ home">
          <BrandLogo />
        </Link>

        {/* desktop nav */}
        <NavigationMenu className="hidden lg:flex ml-6">
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
            {NAV_LINKS.slice(0, 1).map((l) => (
              <NavigationMenuItem key={l.href}>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link href={l.href}>{l.label}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link href="/shop?category=new-arrivals">New Arrivals</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link href="/delivery">Delivery</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link href="/about">About</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link href="/contact">Contact</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
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
                  placeholder="Search jewelry..."
                  className="w-48 lg:w-64 pr-8"
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
            className="md:hidden h-9 w-9"
            onClick={() => {
              const q = window.prompt("Search jewelry:");
              if (q && q.trim()) window.location.assign(`/shop?q=${encodeURIComponent(q.trim())}`);
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
