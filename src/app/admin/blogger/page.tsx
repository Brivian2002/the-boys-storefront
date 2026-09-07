import { redirect } from "next/navigation";
import { Database, RefreshCw, Info, ArrowRight } from "lucide-react";
import { getSession } from "@/lib/auth/admin-session";
import { AdminShell } from "@/components/admin/admin-shell";
import { getCatalogStatus } from "@/lib/blogger/client";
import { configStatus } from "@/lib/env";
import { BloggerActions } from "@/components/admin/blogger-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminBloggerPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const status = await getCatalogStatus();
  const cfg = configStatus();

  return (
    <AdminShell
      active="blogger"
      title="Blogger database"
      description="Product catalog powered by Blogger"
      session={session}
    >
      {/* Status overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              Catalog status
            </CardTitle>
            <CardDescription>
              Live status of the product catalog.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Source</span>
              <Badge variant="secondary">
                {status.source === "blogger" ? "Blogger API" : "Database cache"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total products</span>
              <span className="font-medium">{status.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Published</span>
              <span className="font-medium">{status.published}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Drafts</span>
              <span className="font-medium">{status.draft}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Hidden</span>
              <span className="font-medium">{status.hidden}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Freshness</span>
              <span className="font-medium">{status.fresh ? "Fresh" : "Stale"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Blogger configuration</CardTitle>
            <CardDescription>
              Credentials used to read from and write to Blogger.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Blog ID</span>
              <Badge
                variant="secondary"
                className={
                  cfg.blogger
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : "bg-muted text-muted-foreground"
                }
              >
                {cfg.blogger ? "Set" : "Not set"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Read access (API key / refresh token)</span>
              <Badge
                variant="secondary"
                className={
                  cfg.bloggerRead
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : "bg-muted text-muted-foreground"
                }
              >
                {cfg.bloggerRead ? "Configured" : "Not configured"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Write access (OAuth)</span>
              <Badge
                variant="secondary"
                className={
                  cfg.bloggerWrite
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : "bg-muted text-muted-foreground"
                }
              >
                {cfg.bloggerWrite ? "Configured" : "Not configured"}
              </Badge>
            </div>
            <div className="pt-2">
              <Button asChild variant="outline" size="sm">
                <a href="/admin/configuration">
                  Open configuration
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flow */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How the catalog works</CardTitle>
          <CardDescription>
            Blogger is the source of truth. The store reads from the Blogger
            API (when configured) or the local database cache.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-semibold">
                1
              </span>
              <span className="text-muted-foreground">
                The owner creates products in the admin (or posts them directly
                to Blogger with the product label schema).
              </span>
            </li>
            <li className="flex gap-3">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-semibold">
                2
              </span>
              <span className="text-muted-foreground">
                Product posts are parsed (price, currency, category, materials,
                badges, attributes) from their labels and content.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-semibold">
                3
              </span>
              <span className="text-muted-foreground">
                The catalog is cached server-side with a short TTL and a
                stale-while-revalidate fallback so a Blogger outage never takes
                the storefront down.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-semibold">
                4
              </span>
              <span className="text-muted-foreground">
                The public storefront only ever sees typed Product objects —
                never raw Blogger posts, labels, or URLs.
              </span>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* No-products notice */}
      {status.total === 0 && (
        <Card className="mt-6 border-teal-500/30 bg-teal-500/5">
          <CardContent className="flex items-start gap-3 py-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
            <div className="text-sm">
              <p className="font-medium">No products in the catalog yet</p>
              <p className="mt-1 text-muted-foreground">
                The owner adds products by posting them to Blogger (or via the
                admin product composer). The store ships with{" "}
                <strong>0 products</strong> by design.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            Actions
          </CardTitle>
          <CardDescription>
            Refresh the catalog cache or seed demo data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BloggerActions status={status} />
        </CardContent>
      </Card>
    </AdminShell>
  );
}
