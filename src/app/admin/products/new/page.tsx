import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/admin-session";
import { AdminShell } from "@/components/admin/admin-shell";
import { ProductComposer } from "@/components/admin/product-composer";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <AdminShell
      active="products"
      title="New product"
      description="Create a new item in the catalog"
      session={session}
    >
      <ProductComposer mode="create" />
    </AdminShell>
  );
}
