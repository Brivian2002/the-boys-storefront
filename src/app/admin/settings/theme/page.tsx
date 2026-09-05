import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/admin-session";
import { AdminShell } from "@/components/admin/admin-shell";
import { ThemeControls } from "./theme-controls";

export const dynamic = "force-dynamic";

export default async function AdminThemePage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <AdminShell
      active="theme"
      title="Theme &amp; palette"
      description="Switch palettes and light/dark mode"
      session={session}
    >
      <ThemeControls />
    </AdminShell>
  );
}
