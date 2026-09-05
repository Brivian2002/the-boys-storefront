import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/admin-session";
import { getAdminProduct } from "@/lib/blogger/admin-store";
import { AdminShell } from "@/components/admin/admin-shell";
import { ProductComposer } from "@/components/admin/product-composer";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const product = await getAdminProduct(id);
  if (!product) notFound();

  return (
    <AdminShell
      active="products"
      title="Edit product"
      description={product.name}
      session={session}
    >
      <ProductComposer mode="edit" product={product} />
    </AdminShell>
  );
}
