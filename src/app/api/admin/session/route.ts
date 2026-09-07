import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/admin-session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.sub,
      email: session.email,
      name: session.name,
      role: session.role,
    },
    issuedAt: session.issuedAt,
    expiresAt: session.expiresAt,
  });
}
