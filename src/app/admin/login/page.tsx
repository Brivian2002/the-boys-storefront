import { redirect } from "next/navigation";
import { getSession, hasAdminPassword, hasGoogleOAuth } from "@/lib/auth/admin-session";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/admin");
  }
  return (
    <LoginForm
      initialInfo={{
        hasPassword: hasAdminPassword(),
        hasGoogleOAuth: hasGoogleOAuth(),
      }}
    />
  );
}
