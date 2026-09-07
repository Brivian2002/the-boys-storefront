"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingBag,
  Star,
  Inbox,
  Newspaper,
  Database,
  Settings,
  Palette,
  SlidersHorizontal,
  BarChart3,
  Users,
  LogOut,
  Menu,
  ExternalLink,
  Sun,
  Moon,
  Search,
  Bell,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandLogo } from "@/components/brand-logo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { toast } from "sonner";

export type AdminNavKey =
  | "overview"
  | "products"
  | "categories"
  | "orders"
  | "reviews"
  | "inbox"
  | "blog"
  | "blogger"
  | "settings"
  | "theme"
  | "config"
  | "analytics"
  | "admins";

interface NavItem {
  key: AdminNavKey;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Manage",
    items: [
      { key: "overview", label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { key: "products", label: "Products", href: "/admin/products", icon: Package },
      { key: "categories", label: "Categories", href: "/admin/categories", icon: Tags },
      { key: "orders", label: "Orders", href: "/admin/payments", icon: ShoppingBag },
    ],
  },
  {
    label: "Content",
    items: [
      { key: "reviews", label: "Reviews", href: "/admin/reviews", icon: Star },
      { key: "inbox", label: "Inbox", href: "/admin/inbox", icon: Inbox },
      { key: "blog", label: "Blog posts", href: "/admin/blog", icon: Newspaper },
    ],
  },
  {
    label: "System",
    items: [
      { key: "blogger", label: "Blogger database", href: "/admin/blogger", icon: Database },
      { key: "settings", label: "Store settings", href: "/admin/settings", icon: Settings },
      { key: "theme", label: "Theme", href: "/admin/settings/theme", icon: Palette },
      { key: "config", label: "Configuration", href: "/admin/configuration", icon: SlidersHorizontal },
      { key: "analytics", label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { key: "admins", label: "Admins", href: "/admin/users", icon: Users },
    ],
  },
];

interface AdminShellProps {
  active: AdminNavKey;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  session: {
    email: string;
    name: string;
    role?: string;
  } | null;
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
      <div className="flex h-16 items-center border-b border-border/60 px-5">
        <Link href="/admin" onClick={onNavigate} className="flex items-center">
          <BrandLogo />
        </Link>
      </div>

      <nav
        className="flex-1 overflow-y-auto p-3 scrollbar-elegant"
        aria-label="Admin navigation"
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {group.label}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
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
          </div>
        ))}

        <div className="my-2 border-t border-border/60" />

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

      <div className="border-t border-border/60 p-3">
        <div className="mb-2 rounded-md bg-muted/60 px-3 py-2">
          <p className="truncate text-xs font-medium text-foreground">
            {session?.name ?? "Admin"}
          </p>
          <p className="truncate text-[0.7rem] text-muted-foreground">
            {session?.email ?? ""}
          </p>
          {session?.role && (
            <p className="mt-1 text-[0.6rem] uppercase tracking-wider text-muted-foreground/70">
              {session.role}
            </p>
          )}
        </div>
        <LogoutButton />
      </div>
    </div>
  );
}

function UserDropdown({ session }: { session: AdminShellProps["session"] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-full p-0.5 pr-2 transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Account menu"
        >
          <Image
            src="/founder-avatar.png"
            alt={session?.name ?? "Admin avatar"}
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover ring-1 ring-border"
          />
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{session?.name ?? "Admin"}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">
            {session?.email ?? ""}
          </span>
          {session?.role && (
            <span className="text-[0.6rem] uppercase tracking-wider text-muted-foreground/70">
              {session.role}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin/users" className="cursor-pointer">
            <Users className="mr-2 h-4 w-4" />
            Manage admins
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/configuration" className="cursor-pointer">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Configuration
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={async () => {
            try {
              await fetch("/api/admin/logout", { method: "POST" });
            } catch {
              /* ignore */
            }
            window.location.href = "/admin/login";
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
  const [search, setSearch] = React.useState("");
  const router = usePathname();

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    if (q) {
      window.location.href = `/admin/products?q=${encodeURIComponent(q)}`;
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:flex lg:flex-col">
        <SidebarContent active={active} session={session} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6">
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

          <form onSubmit={submitSearch} className="hidden max-w-md flex-1 sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="h-9 pl-9"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {actions}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              aria-label="Notifications"
            >
              <Bell className="h-[1.1rem] w-[1.1rem]" />
            </Button>
            <ThemeToggleMini />
            <UserDropdown session={session} />
          </div>
        </header>

        <div className="border-b border-border bg-card px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-xl font-semibold tracking-tight sm:text-2xl">
            {title}
          </h1>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>

        <footer className="border-t border-border bg-card px-4 py-4 text-center sm:px-6">
          <p className="text-xs text-muted-foreground">
            Afrocentric Jewelry by LaGlitz · Admin · Protected area · Noindex
          </p>
        </footer>
      </div>
    </div>
  );
}

export function adminToast(message: string, description?: string) {
  toast.success(message, description ? { description } : undefined);
}
