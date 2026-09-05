"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  CreditCard,
  Palette,
  Truck,
  BarChart3,
  LogOut,
  Menu,
  ExternalLink,
  Sun,
  Moon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { toast } from "sonner";

export type AdminNavKey =
  | "overview"
  | "products"
  | "categories"
  | "payments"
  | "theme"
  | "delivery"
  | "analytics";

interface NavItem {
  key: AdminNavKey;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const NAV_ITEMS: NavItem[] = [
  { key: "overview", label: "Overview", href: "/admin", icon: LayoutDashboard },
  { key: "products", label: "Products", href: "/admin/products", icon: Package },
  { key: "categories", label: "Categories", href: "/admin/categories", icon: Tags },
  { key: "payments", label: "Payments", href: "/admin/payments", icon: CreditCard },
  { key: "theme", label: "Theme", href: "/admin/settings/theme", icon: Palette },
  { key: "delivery", label: "Delivery", href: "/admin/settings/delivery", icon: Truck },
  { key: "analytics", label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

interface AdminShellProps {
  active: AdminNavKey;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  session: { email: string; name: string; provider: "password" | "google" } | null;
  children: React.ReactNode;
}

function LogoutButton({ onDone }: { onDone?: () => void }) {
  const [loading, setLoading] = React.useState(false);
  const handle = async () => {
    setLoading(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // ignore network errors - redirect anyway
    } finally {
      setLoading(false);
      onDone?.();
      // Use window.location for hard redirect to clear any client state
      window.location.href = "/admin/login";
    }
  };
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handle}
      disabled={loading}
      className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-destructive/10"
    >
      <LogOut className="h-4 w-4" />
      {loading ? "Signing out..." : "Sign out"}
    </Button>
  );
}

function ThemeToggleMini() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="h-9 w-9"
    >
      <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

function SidebarContent({
  active,
  session,
  onNavigate,
}: {
  active: AdminNavKey;
  session: AdminShellProps["session"];
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border/60 px-5">
        <Link href="/admin" onClick={onNavigate} className="flex items-center">
          <BrandLogo />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3" aria-label="Admin navigation">
        <p className="px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Manage
        </p>
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="my-4 border-t border-border/60" />

        <p className="px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Storefront
        </p>
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          View store
        </Link>
      </nav>

      {/* User + logout */}
      <div className="border-t border-border/60 p-3">
        <div className="mb-2 rounded-md bg-muted/60 px-3 py-2">
          <p className="truncate text-xs font-medium text-foreground">{session?.name ?? "Admin"}</p>
          <p className="truncate text-[0.7rem] text-muted-foreground">{session?.email ?? ""}</p>
          <p className="mt-1 text-[0.6rem] uppercase tracking-wider text-muted-foreground/70">
            via {session?.provider ?? "password"}
          </p>
        </div>
        <LogoutButton />
      </div>
    </div>
  );
}

export function AdminShell({
  active,
  title,
  description,
  actions,
  session,
  children,
}: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:flex lg:flex-col">
        <SidebarContent active={active} session={session} />
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6">
          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Admin navigation</SheetTitle>
              </SheetHeader>
              <SidebarContent
                active={active}
                session={session}
                onNavigate={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <h1 className="truncate font-serif text-xl font-semibold tracking-tight">{title}</h1>
            {description && (
              <p className="hidden truncate text-xs text-muted-foreground sm:block">{description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {actions}
            <ThemeToggleMini />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>

        {/* Footer */}
        <footer className="border-t border-border bg-card px-4 py-4 text-center sm:px-6">
          <p className="text-xs text-muted-foreground">
            LA GLITZ Admin · Protected area · Noindex
          </p>
        </footer>
      </div>
    </div>
  );
}

/**
 * Helper to render a small toast on client-side mutation success.
 */
export function adminToast(message: string, description?: string) {
  toast.success(message, description ? { description } : undefined);
}
