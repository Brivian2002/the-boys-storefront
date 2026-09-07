import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/admin-session";
import { AdminShell } from "@/components/admin/admin-shell";
import { SettingsEditor } from "@/components/admin/settings-editor";
import { getSiteSettings } from "@/lib/site/store";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const settings = await getSiteSettings();

  return (
    <AdminShell
      active="settings"
      title="Store settings"
      description="Brand, contact, delivery, regions and announcement"
      session={session}
    >
      <SettingsEditor settings={settings} />
    </AdminShell>
  );
}
