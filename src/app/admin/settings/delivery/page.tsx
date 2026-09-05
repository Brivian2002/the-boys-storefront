import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/admin-session";
import { AdminShell } from "@/components/admin/admin-shell";
import { DeliveryControls } from "@/components/admin/delivery-controls";

export const dynamic = "force-dynamic";

export default async function AdminDeliveryPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <AdminShell
      active="delivery"
      title="Delivery &amp; contact"
      description="Ghana delivery regions and store contact details"
      session={session}
    >
      <DeliveryControls />
    </AdminShell>
  );
}
