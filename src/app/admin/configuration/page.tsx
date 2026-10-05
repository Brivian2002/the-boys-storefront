import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, AlertCircle, ArrowRight, Info } from "lucide-react";
import { getSession } from "@/lib/auth/admin-session";
import { AdminShell } from "@/components/admin/admin-shell";
import { configStatus, type ConfigStatus } from "@/lib/env";
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

interface Group {
  label: string;
  items: { key: keyof ConfigStatus; label: string; env: string }[];
}

const GROUPS: Group[] = [
  {
    label: "Storefront",
    items: [
      { key: "database", label: "Database (DATABASE_URL)", env: "DATABASE_URL" },
      { key: "sessionSecret", label: "Admin session secret", env: "ADMIN_SESSION_SECRET" },
      { key: "appBaseUrl", label: "App base URL", env: "APP_BASE_URL" },
      { key: "maps", label: "Google Maps", env: "MAPS_API_KEY" },
    ],
  },
  {
    label: "Catalog & content",
    items: [
      { key: "bloggerRead", label: "Blogger read", env: "BLOGGER_BLOG_ID + API_KEY" },
      { key: "bloggerWrite", label: "Blogger write (OAuth)", env: "GOOGLE_BLOGGER_*" },
      { key: "blog", label: "Editorial blog", env: "BLOG_BLOGGER_BLOG_ID" },
    ],
  },
  {
    label: "Payments & messaging",
    items: [
      { key: "paystack", label: "Paystack", env: "PAYSTACK_SECRET_KEY + PUBLIC_KEY" },
      { key: "emailjs", label: "EmailJS (contact form)", env: "NEXT_PUBLIC_EMAILJS_*" },
      { key: "groq", label: "Groq AI assistant", env: "GROQ_API_KEY" },
    ],
  },
  {
    label: "Media & analytics",
    items: [
      { key: "blob", label: "Vercel Blob (uploads)", env: "BLOB_READ_WRITE_TOKEN" },
      { key: "analytics", label: "Analytics", env: "ANALYTICS_ENDPOINT + WEBSITE_ID" },
    ],
  },
];

export default async function AdminConfigurationPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const cfg = configStatus();
  const total = GROUPS.flatMap((g) => g.items).length;
  const configured = GROUPS.flatMap((g) => g.items).filter((i) => cfg[i.key]).length;

  return (
    <AdminShell
      active="config"
      title="Configuration"
      description="Integration health and environment variable status"
      session={session}
    >
      {/* Overall status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {configured === total ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            )}
            {configured} of {total} integrations configured
          </CardTitle>
          <CardDescription>
            Secret values are never displayed — only configured / not
            configured. Set them in your Vercel / hosting environment
            variables.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${(configured / total) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Grouped badges */}
      <div className="grid gap-4 md:grid-cols-2">
        {GROUPS.map((group) => (
          <Card key={group.label}>
            <CardHeader>
              <CardTitle className="text-base">{group.label}</CardTitle>
              <CardDescription>
                {group.items.filter((i) => cfg[i.key]).length} /{" "}
                {group.items.length} configured
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {group.items.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/30 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.label}</p>
                    <p className="text-[0.7rem] text-muted-foreground font-mono truncate">
                      {item.env}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      cfg[item.key]
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                    }
                  >
                    {cfg[item.key] ? "Configured" : "Not set"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 border-teal-500/30 bg-blue-600/5">
        <CardContent className="flex items-start gap-3 py-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="text-sm">
            <p className="font-medium">How to configure</p>
            <p className="mt-1 text-muted-foreground">
              Add the listed environment variables in your hosting platform
              (Vercel, Netlify, or your server). Redeploy after setting them.
              Most variables are optional — the store degrades gracefully when
              they are missing.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/admin/settings">
            Store settings
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/blogger">
            Blogger database
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </AdminShell>
  );
}
