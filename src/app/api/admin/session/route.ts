import { NextResponse } from "next/server";
import { getSession, ADMIN_ALLOWLIST } from "@/lib/auth/admin-session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  if (!ADMIN_ALLOWLIST.includes(session.email)) {
    return NextResponse.json({ authenticated: false }, { status: 403 });
  }
  return NextResponse.json({
    authenticated: true,
    email: session.email,
    name: session.name,
    provider: session.provider,
    issuedAt: session.issuedAt,
    expiresAt: session.expiresAt,
  });
}
