import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/admin-session";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminNotFound() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <AdminShell
      active="products"
      title="Not found"
      description="The page or product you were looking for does not exist."
      session={session}
    >
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <FileQuestion className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-serif text-2xl font-semibold">404 — Not found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This product may have been deleted, or the URL is incorrect.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products">Back to products</Link>
        </Button>
      </div>
    </AdminShell>
  );
}
