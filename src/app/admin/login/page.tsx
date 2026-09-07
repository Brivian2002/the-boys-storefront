import { redirect } from "next/navigation";
import { getSession, adminUserCount } from "@/lib/auth/admin-session";
import { LoginScreen } from "./login-screen";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/admin");
  }
  const userCount = await adminUserCount().catch(() => 0);
  return <LoginScreen firstRun={userCount === 0} />;
}
