import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";

import { getSession } from "@/lib/auth/admin-session";
import { listAllProducts } from "@/lib/blogger/admin-store";

import { AdminShell } from "@/components/admin/admin-shell";
import { ProductsTable } from "@/components/admin/products-table";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const products = await listAllProducts();

  return (
    <AdminShell
      active="products"
      title="Products"
      description={`${products.length} ${products.length === 1 ? "product" : "products"} in the catalog`}
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
      {/* Mobile add button */}
      <div className="mb-4 sm:hidden">
        <Button asChild className="w-full">
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" />
            Add product
          </Link>
        </Button>
      </div>

      <ProductsTable products={products} />
    </AdminShell>
  );
}
