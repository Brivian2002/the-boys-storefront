import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createSession,
  verifyPassword,
  findAdminByIdentifier,
  hashPassword,
  createAdminUser,
  adminUserCount,
  AdminAuthError,
} from "@/lib/auth/admin-session";

export const dynamic = "force-dynamic";

const LoginSchema = z.object({
  mode: z.enum(["login", "setup"]).optional(),
  identifier: z.string().min(2).optional(),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(4),
  remember: z.boolean().optional(),
});

/**
 * POST /api/admin/login
 *
 * Two modes:
 *  - { mode: "setup", name, email, password }: first-run owner creation.
 *    Only works when no admin users exist yet.
 *  - { mode: "login" (default), identifier, password, remember? }:
 *    Standard login. Identifier can be name OR email.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { mode, password, remember } = parsed.data;

  // ---------------- First-run setup ----------------
  if (mode === "setup") {
    const { name, email } = parsed.data;
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required for setup" },
        { status: 400 }
      );
    }
    const count = await adminUserCount().catch(() => 0);
    if (count > 0) {
      return NextResponse.json(
        { error: "Setup is already complete. Sign in instead." },
        { status: 400 }
      );
    }
    try {
      const user = await createAdminUser({
        name,
        email,
        password,
        role: "OWNER",
      });
      await createSession({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
      return NextResponse.json({ ok: true, setup: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Setup failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
  }

  // ---------------- Standard login ----------------
  const identifier = parsed.data.identifier;
  if (!identifier) {
    return NextResponse.json(
      { error: "Name or email is required" },
      { status: 400 }
    );
  }

  const user = await findAdminByIdentifier(identifier);
  if (!user) {
    return NextResponse.json(
      { error: "Account not found" },
      { status: 401 }
    );
  }
  if (!user.isActive) {
    return NextResponse.json(
      { error: "Account is deactivated. Contact an owner." },
      { status: 403 }
    );
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json(
      { error: "Incorrect password" },
      { status: 401 }
    );
  }

  // remember is accepted for API stability — current implementation uses a
  // fixed 12h TTL but we acknowledge the preference.
  void remember;

  try {
    await createSession({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "OWNER" | "ADMIN" | "EDITOR",
    });
  } catch (e) {
    if (e instanceof AdminAuthError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    throw e;
  }

  return NextResponse.json({
    ok: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}

/** GET /api/admin/login — surface first-run state for the login screen. */
export async function GET() {
  const count = await adminUserCount().catch(() => 0);
  return NextResponse.json({
    firstRun: count === 0,
    userCount: count,
  });
}
