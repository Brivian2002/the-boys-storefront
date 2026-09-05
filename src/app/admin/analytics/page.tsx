import { redirect } from "next/navigation";
import { BarChart3, Plug, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";

import { getSession } from "@/lib/auth/admin-session";
import { AdminShell } from "@/components/admin/admin-shell";
import { ConfigStatus } from "@/components/admin/stat-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const analyticsConfigured = Boolean(
    process.env.ANALYTICS_ENDPOINT && process.env.ANALYTICS_WEBSITE_ID
  );

  return (
    <AdminShell
      active="analytics"
      title="Analytics"
      description="Real traffic data from your analytics provider"
      session={session}
    >
      {/* Config status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="h-4 w-4" />
            Provider configuration
          </CardTitle>
          <CardDescription>
            Analytics are read directly from your provider — LA GLITZ does not
            collect or invent traffic data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <ConfigStatus
            label="Analytics endpoint (ANALYTICS_ENDPOINT)"
            configured={Boolean(process.env.ANALYTICS_ENDPOINT)}
          />
          <ConfigStatus
            label="Website ID (ANALYTICS_WEBSITE_ID)"
            configured={Boolean(process.env.ANALYTICS_WEBSITE_ID)}
          />
        </CardContent>
      </Card>

      {/* Empty state */}
      {!analyticsConfigured ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div className="max-w-md space-y-2">
              <h2 className="font-serif text-xl font-semibold">Analytics not configured</h2>
              <p className="text-sm text-muted-foreground">
                Connect an analytics provider (e.g. Plausible, Umami, Matomo, or
                Vercel Analytics) via the{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  ANALYTICS_ENDPOINT
                </code>{" "}
                and{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  ANALYTICS_WEBSITE_ID
                </code>{" "}
                environment variables to see real traffic data here.
              </p>
            </div>
            <div className="rounded-md border border-border bg-muted/30 p-3 text-left text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Why no data?</p>
              <p className="mt-1">
                LA GLITZ does <strong>not</strong> include a built-in tracker or
                invent traffic/popularity/sales metrics. Until you connect a
                provider, this page intentionally shows no charts — only the
                configuration status above.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <a
                href="https://plausible.io/docs"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                Plausible docs
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Analytics connected
            </CardTitle>
            <CardDescription>
              Your provider is configured. Open the dashboard on your provider&apos;s site
              for the full report.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
              <p>
                <span className="font-medium">Endpoint:</span>{" "}
                <code className="rounded bg-background px-1.5 py-0.5 text-xs">
                  {process.env.ANALYTICS_ENDPOINT}
                </code>
              </p>
              <p className="mt-1">
                <span className="font-medium">Website ID:</span>{" "}
                <code className="rounded bg-background px-1.5 py-0.5 text-xs">
                  {process.env.ANALYTICS_WEBSITE_ID}
                </code>
              </p>
            </div>
            <Button asChild size="sm">
              <a
                href={process.env.ANALYTICS_ENDPOINT}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                Open analytics dashboard
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6 border-blue-500/30 bg-blue-500/5">
        <CardContent className="flex items-start gap-3 py-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <div className="text-sm">
            <p className="font-medium text-blue-700 dark:text-blue-300">
              Privacy first
            </p>
            <p className="mt-1 text-blue-700/80 dark:text-blue-300/80">
              No traffic, popularity, or sales metrics are invented. When no
              provider is configured, this page shows the configuration status
              only — never fabricated numbers.
            </p>
          </div>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
