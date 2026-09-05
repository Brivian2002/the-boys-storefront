import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/admin-session";
import { AdminShell } from "@/components/admin/admin-shell";
import { CATEGORY_LABELS, CATEGORY_DESCRIPTIONS, type Category } from "@/lib/blogger/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Tag } from "lucide-react";

export const dynamic = "force-dynamic";

const CATEGORY_ENTRIES = Object.entries(CATEGORY_LABELS) as [Category, string][];

export default async function AdminCategoriesPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <AdminShell
      active="categories"
      title="Catalog taxonomy"
      description="Blogger labels drive the storefront categories and filters."
      session={session}
    >
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-3 py-4">
          <Tag className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="text-sm">
            <p className="font-medium">Live Blogger taxonomy</p>
            <p className="mt-1 text-muted-foreground">
              Categories are derived from labels on published Blogger product posts. Add or change a category from the product composer; the storefront updates from Blogger on its next catalog refresh.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORY_ENTRIES.map(([key, label]) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="text-base">{label}</CardTitle>
              <CardDescription className="font-mono text-[0.7rem]">label: category-{key}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{CATEGORY_DESCRIPTIONS[key]}</p>
              <Button asChild variant="outline" size="sm">
                <Link href={`/shop?category=${key}`} target="_blank" rel="noopener noreferrer">
                  View storefront <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
