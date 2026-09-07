import { redirect } from "next/navigation";
import { getSession, listAdminUsers } from "@/lib/auth/admin-session";
import { AdminShell } from "@/components/admin/admin-shell";
import { UsersManager } from "@/components/admin/users-manager";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  // Only OWNER may view/manage admin users
  if (session.role !== "OWNER") {
    return (
      <AdminShell
        active="users"
        title="Admins"
        description="Manage admin accounts"
        session={session}
      >
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <p className="font-medium">Access restricted</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Only OWNER accounts can manage admin users.
          </p>
        </div>
      </AdminShell>
    );
  }

  const users = await listAdminUsers();

  return (
    <AdminShell
      active="users"
      title="Admins"
      description="Manage admin accounts and roles"
      session={session}
    >
      <UsersManager users={users} currentEmail={session.email} />
    </AdminShell>
  );
}
