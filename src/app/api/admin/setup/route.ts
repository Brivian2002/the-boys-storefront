import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createAdminUser,
  adminUserCount,
  createSession,
  AdminAuthError,
} from "@/lib/auth/admin-session";

export const dynamic = "force-dynamic";

const SetupSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  password: z.string().min(4).max(200),
});

/**
 * POST /api/admin/setup — first-run owner account creation.
 *
 * Only succeeds when no admin users exist. After creating the OWNER, a
 * session is issued so the owner is logged in immediately.
 */
export async function POST(req: NextRequest) {
  const count = await adminUserCount().catch(() => 0);
  if (count > 0) {
    return NextResponse.json(
      { error: "Setup is already complete" },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const parsed = SetupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const user = await createAdminUser({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
      role: "OWNER",
    });
    await createSession({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    return NextResponse.json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (e) {
    if (e instanceof AdminAuthError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    const msg = e instanceof Error ? e.message : "Setup failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
