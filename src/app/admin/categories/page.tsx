import { redirect } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getSession } from "@/lib/auth/admin-session";
import { AdminShell } from "@/components/admin/admin-shell";
import { CategoryEditor } from "@/components/admin/category-editor";
import {
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
  type Category,
} from "@/lib/blogger/types";
import { getSiteSettings } from "@/lib/site/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const CATEGORY_ENTRIES = Object.entries(CATEGORY_LABELS) as [Category, string][];

async function loadCategoryCopy(): Promise<Record<Category, string>> {
  const out: Record<string, string> = { ...CATEGORY_DESCRIPTIONS };
  try {
    const rows = await db.siteSetting.findMany({
      where: { key: { startsWith: "category:description:" } },
    });
    for (const r of rows) {
      const key = r.key.replace("category:description:", "");
      out[key] = r.value;
    }
  } catch {
    // ignore — fall back to defaults
  }
  return out as Record<Category, string>;
}

export default async function AdminCategoriesPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  // Make sure site settings are seeded (so /api/admin/categories has somewhere to write)
  await getSiteSettings().catch(() => null);
  const copy = await loadCategoryCopy();

  return (
    <AdminShell
      active="categories"
      title="Categories"
      description="Edit the merchandising copy shown on /shop?category=..."
      session={session}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {CATEGORY_ENTRIES.map(([key, label]) => (
          <CategoryEditor
            key={key}
            categoryKey={key}
            label={label}
            defaultDescription={CATEGORY_DESCRIPTIONS[key]}
            initialDescription={copy[key]}
          />
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            See each category live on the storefront.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {CATEGORY_ENTRIES.map(([key, label]) => (
            <Link
              key={key}
              href={`/shop?category=${key}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted transition-colors"
            >
              {label}
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
          ))}
        </CardContent>
      </Card>
    </AdminShell>
  );
}
