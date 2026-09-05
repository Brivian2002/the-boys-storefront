import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Eye,
  EyeOff,
  FileEdit,
  CreditCard,
  Layers,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { getSession } from "@/lib/auth/admin-session";
import { listAllProducts, getSalesStats } from "@/lib/blogger/admin-store";
import { getCatalogStatus } from "@/lib/blogger/client";
import { formatGHS } from "@/lib/ghana";

import { AdminShell } from "@/components/admin/admin-shell";
import { StatCard, ConfigStatus } from "@/components/admin/stat-card";
import {
  CatalogRefreshButton,
  CatalogStatusBadge,
} from "@/components/admin/catalog-refresh-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

function timeAgo(iso: string | number | null): string {
  if (!iso) return "Never";
  const ts = typeof iso === "string" ? new Date(iso).getTime() : iso;
  const diff = Date.now() - ts;
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} hr ago`;
  return `${Math.floor(diff / 86_400_000)} days ago`;
}

export default async function AdminOverviewPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const [products, catalogStatus, salesStats] = await Promise.all([
    listAllProducts(),
    getCatalogStatus(),
    getSalesStats(),
  ]);

  const configChecks = [
    {
      label: "Blogger CMS (BLOGGER_BLOG_ID + API_KEY)",
      configured: Boolean(process.env.BLOGGER_BLOG_ID && process.env.BLOGGER_API_KEY),
    },
    {
      label: "Paystack (PAYSTACK_SECRET_KEY)",
      configured: Boolean(process.env.PAYSTACK_SECRET_KEY),
    },
    {
      label: "Google OAuth (GOOGLE_CLIENT_ID + SECRET)",
      configured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
    {
      label: "Maps (MAPS_API_KEY)",
      configured: Boolean(process.env.MAPS_API_KEY),
    },
    {
      label: "Analytics (ANALYTICS_ENDPOINT + WEBSITE_ID)",
      configured: Boolean(process.env.ANALYTICS_ENDPOINT && process.env.ANALYTICS_WEBSITE_ID),
    },
    {
      label: "Admin password (ADMIN_DASHBOARD_PASSWORD)",
      configured: Boolean(process.env.ADMIN_DASHBOARD_PASSWORD),
    },
  ];

  return (
    <AdminShell
      active="overview"
      title="Overview"
      description="Catalog, sales, and configuration at a glance"
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
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Welcome back
        </p>
        <h2 className="mt-1 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
          {session.name} <span className="text-muted-foreground text-base font-normal">· {session.email}</span>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Signed in via <span className="font-medium text-foreground">{session.provider}</span>. Sessions expire after 12 hours.
        </p>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Total products"
          value={products.length}
          hint={`${catalogStatus.published} published`}
          icon={Package}
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

      <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Catalog source"
          value={catalogStatus.source === "blogger" ? "Blogger" : "Not configured"}
          hint={catalogStatus.bloggerConfigured ? "Blogger configured" : "Blogger not configured"}
          icon={Layers}
        />
        <StatCard
          label="Catalog freshness"
          value={catalogStatus.fresh ? "Fresh" : "Stale"}
          hint={`Fetched ${timeAgo(catalogStatus.lastFetched)}`}
          icon={RefreshCw}
          tone={catalogStatus.fresh ? "success" : "warning"}
        />
        <StatCard
          label="Successful payments"
          value={salesStats.count}
          hint={salesStats.demo ? "demo records" : "Paystack"}
          icon={CreditCard}
        />
        <StatCard
          label="Total sales"
          value={formatGHS(salesStats.totalGhs)}
          hint={
            salesStats.lastSaleAt
              ? `Last sale ${timeAgo(salesStats.lastSaleAt)}`
              : "No sales yet"
          }
          icon={CreditCard}
          tone="success"
        />
      </div>

      {/* Two-column section */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Catalog status panel */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
            <div>
              <CardTitle>Catalog status</CardTitle>
              <CardDescription>
                Live status of the product catalog cache and Blogger connection.
              </CardDescription>
            </div>
            <CatalogStatusBadge status={catalogStatus} />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-md border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Source</p>
                <p className="mt-0.5 text-sm font-medium">
                  {catalogStatus.source === "blogger" ? "Blogger API" : "Awaiting Blogger"}
                </p>
              </div>
              <div className="rounded-md border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Last fetched</p>
                <p className="mt-0.5 text-sm font-medium">{timeAgo(catalogStatus.lastFetched)}</p>
              </div>
              <div className="rounded-md border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Total cached</p>
                <p className="mt-0.5 text-sm font-medium">{catalogStatus.total}</p>
              </div>
              <div className="rounded-md border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Blogger configured</p>
                <p className="mt-0.5 text-sm font-medium">
                  {catalogStatus.bloggerConfigured ? "Yes" : "No"}
                </p>
              </div>
            </div>

            {catalogStatus.source === "empty" && (
              <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>Blogger credentials are not configured for this deployment. The public catalog stays empty until the required Vercel variables are available.</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <CatalogRefreshButton />
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/products">Manage products</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Configuration status panel */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>
              Secret values are never displayed — only configured / not configured.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {configChecks.map((c) => (
              <ConfigStatus key={c.label} label={c.label} configured={c.configured} />
            ))}
            <p className="pt-2 text-[0.7rem] text-muted-foreground">
              <CheckCircle2 className="mr-1 inline h-3 w-3 text-emerald-500" />
              Configure these in your Vercel / hosting environment variables.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/products/new"
          className="group rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          <Plus className="h-5 w-5 text-primary" />
          <p className="mt-2 text-sm font-semibold">Add product</p>
          <p className="text-xs text-muted-foreground">Create a new piece in the catalog.</p>
        </Link>
        <Link
          href="/admin/products"
          className="group rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          <Package className="h-5 w-5 text-primary" />
          <p className="mt-2 text-sm font-semibold">Manage products</p>
          <p className="text-xs text-muted-foreground">Edit, hide, or delete existing pieces.</p>
        </Link>
        <Link
          href="/admin/categories"
          className="group rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          <Layers className="h-5 w-5 text-primary" />
          <p className="mt-2 text-sm font-semibold">Edit category copy</p>
          <p className="text-xs text-muted-foreground">Merchandising descriptions for /shop.</p>
        </Link>
        <Link
          href="/admin/payments"
          className="group rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          <CreditCard className="h-5 w-5 text-primary" />
          <p className="mt-2 text-sm font-semibold">View payments</p>
          <p className="text-xs text-muted-foreground">Paystack sales records.</p>
        </Link>
      </div>
    </AdminShell>
  );
}
