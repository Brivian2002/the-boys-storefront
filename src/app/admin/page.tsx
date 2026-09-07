import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Eye,
  EyeOff,
  FileEdit,
  CreditCard,
  Layers,
  Plus,
  Tags,
  Inbox,
  Star,
  Newspaper,
  Database,
  Settings,
  Palette,
  BarChart3,
  Users,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { getSession } from "@/lib/auth/admin-session";
import { listAllProducts, getSalesStats } from "@/lib/blogger/admin-store";
import { getCatalogStatus } from "@/lib/blogger/client";
import { listOrders } from "@/lib/blogger/admin-store";
import { getPublishedReviews } from "@/lib/reviews/client";
import { db } from "@/lib/db";
import { formatGHS, fromMinorUnits } from "@/lib/ghana";
import { configStatus } from "@/lib/env";

import { AdminShell } from "@/components/admin/admin-shell";
import { StatCard } from "@/components/admin/stat-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

const EMPTY_SALES_STATS = {
  totalOrders: 0,
  paidOrders: 0,
  pendingOrders: 0,
  failedOrders: 0,
  revenueMinor: 0,
  currency: "GHS",
  topProducts: [],
  recentOrders: [],
};

function timeAgo(iso: string | null): string {
  if (!iso) return "Never";
  const ts = new Date(iso).getTime();
  const diff = Date.now() - ts;
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} hr ago`;
  return `${Math.floor(diff / 86_400_000)} days ago`;
}

export default async function AdminOverviewPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const [
    products,
    catalogStatus,
    salesStats,
    orders,
    reviews,
    newMessages,
    subscribers,
  ] = await Promise.all([
    listAllProducts().catch((error) => {
      console.warn("Admin product data unavailable", error);
      return [];
    }),
    getCatalogStatus().catch((error) => {
      console.warn("Admin catalog status unavailable", error);
      return {
        source: "empty" as const,
        fresh: false,
        total: 0,
        published: 0,
        draft: 0,
        hidden: 0,
        lastFetched: 0,
        bloggerConfigured: false,
      };
    }),
    getSalesStats().catch((error) => {
      console.warn("Admin sales data unavailable", error);
      return EMPTY_SALES_STATS;
    }),
    listOrders({ limit: 200 }).catch((error) => {
      console.warn("Admin order data unavailable", error);
      return [];
    }),
    getPublishedReviews(1000),
    db.contactMessage.count({ where: { status: "new" } }).catch((error) => {
      console.warn("Admin inbox count unavailable", error);
      return 0;
    }),
    db.subscriber.count().catch((error) => {
      console.warn("Admin subscriber count unavailable", error);
      return 0;
    }),
  ]);

  const cfg = configStatus();
  const integrations = [
    { key: "Blogger", ok: cfg.blogger, label: cfg.blogger ? "Connected" : "Not configured" },
    { key: "Paystack", ok: cfg.paystack, label: cfg.paystack ? "Connected" : "Not configured" },
    { key: "EmailJS", ok: cfg.emailjs, label: cfg.emailjs ? "Connected" : "Not configured" },
    { key: "Vercel Blob", ok: cfg.blob, label: cfg.blob ? "Connected" : "Not configured" },
    { key: "Maps", ok: cfg.maps, label: cfg.maps ? "Connected" : "Not configured" },
    { key: "Analytics", ok: cfg.analytics, label: cfg.analytics ? "Connected" : "Not configured" },
    { key: "Blog", ok: cfg.blog, label: cfg.blog ? "Connected" : "Not configured" },
  ];
  const allConfigured = integrations.every((i) => i.ok);

  const quickActions = [
    {
      href: "/admin/products/new",
      icon: Plus,
      title: "Add product",
      body: "Create a new piece in the catalog.",
    },
    {
      href: "/admin/products",
      icon: Package,
      title: "Manage products",
      body: "Edit, hide, or delete existing pieces.",
    },
    {
      href: "/admin/categories",
      icon: Tags,
      title: "Categories",
      body: "Edit category descriptions and copy.",
    },
    {
      href: "/admin/payments",
      icon: CreditCard,
      title: "Orders",
      body: "View and manage customer orders.",
    },
    {
      href: "/admin/reviews",
      icon: Star,
      title: "Reviews",
      body: "Approve and publish customer reviews.",
    },
    {
      href: "/admin/inbox",
      icon: Inbox,
      title: "Inbox",
      body: "Read contact form messages.",
    },
    {
      href: "/admin/blogger",
      icon: Database,
      title: "Blogger database",
      body: "Catalog status and Blogger flow.",
    },
    {
      href: "/admin/settings",
      icon: Settings,
      title: "Store settings",
      body: "Brand, contact, delivery, regions.",
    },
  ];

  return (
    <AdminShell
      active="overview"
      title="Dashboard"
      description="Catalog, orders and content at a glance"
      session={session}
      actions={
        <Button asChild size="sm" className="hidden sm:inline-flex">
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" />
            Add product
          </Link>
        </Button>
      }
    >
      {/* Welcome header */}
      <div className="mb-6 rounded-xl border border-border bg-card p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
          Welcome back
        </p>
        <h2 className="mt-1 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
          {session.name}{" "}
          <span className="text-muted-foreground text-base font-normal">
            · {session.email}
          </span>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{session.role}</span>. Sessions expire after 12 hours.
        </p>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Products"
          value={products.length}
          hint={`${catalogStatus.published} published`}
          icon={Package}
        />
        <StatCard
          label="Orders"
          value={orders.length}
          hint={`${salesStats.paidOrders} paid`}
          icon={CreditCard}
          tone="success"
        />
        <StatCard
          label="Reviews"
          value={reviews.length}
          hint="Published"
          icon={Star}
        />
        <StatCard
          label="Inbox"
          value={newMessages}
          hint="New messages"
          icon={Inbox}
          tone={newMessages > 0 ? "warning" : "muted"}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Subscribers"
          value={subscribers}
          icon={Newspaper}
          tone="muted"
        />
        <StatCard
          label="Published"
          value={catalogStatus.published}
          icon={Eye}
          tone="success"
        />
        <StatCard
          label="Drafts"
          value={catalogStatus.draft}
          icon={FileEdit}
          tone="muted"
        />
        <StatCard
          label="Hidden"
          value={catalogStatus.hidden}
          icon={EyeOff}
          tone="muted"
        />
      </div>

      {/* Revenue + catalog source */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Revenue (paid)"
          value={
            salesStats.currency
              ? formatGHS(fromMinorUnits(salesStats.revenueMinor), salesStats.currency as "GHS" | "USD")
              : "—"
          }
          hint={
            salesStats.paidOrders > 0
              ? `${salesStats.paidOrders} paid orders`
              : "No paid orders yet"
          }
          icon={CreditCard}
          tone="success"
        />
        <StatCard
          label="Catalog source"
          value={catalogStatus.source === "blogger" ? "Blogger" : "Database"}
          hint={catalogStatus.bloggerConfigured ? "Blogger configured" : "Blogger not configured"}
          icon={Layers}
        />
        <StatCard
          label="Catalog freshness"
          value={catalogStatus.fresh ? "Fresh" : "Stale"}
          hint={`Fetched ${timeAgo(catalogStatus.lastFetched ? new Date(catalogStatus.lastFetched).toISOString() : null)}`}
          icon={Database}
          tone={catalogStatus.fresh ? "success" : "warning"}
        />
        <StatCard
          label="Pending orders"
          value={salesStats.pendingOrders}
          icon={CreditCard}
          tone={salesStats.pendingOrders > 0 ? "warning" : "muted"}
        />
      </div>

      {/* Integration banner */}
      <Card className="mt-6">
        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              {allConfigured ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-500" />
              )}
              Integration status
            </CardTitle>
            <CardDescription>
              {allConfigured
                ? "All integrations are configured. The store is production-ready."
                : "Some integrations are not configured. Visit the Configuration page to set them up."}
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/configuration">
              Configure
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {integrations.map((i) => (
              <div
                key={i.key}
                className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2"
              >
                <span className="text-sm font-medium">{i.key}</span>
                <span
                  className={
                    i.ok
                      ? "inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                      : "inline-flex items-center gap-1 text-xs font-medium text-muted-foreground"
                  }
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${i.ok ? "bg-emerald-500" : "bg-muted-foreground/40"}`}
                  />
                  {i.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <h2 className="mt-8 mb-3 font-serif text-lg font-semibold">Quick actions</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map(({ href, icon: Icon, title, body }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-teal-500/40"
          >
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-semibold">{title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
