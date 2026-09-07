import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin-session";
import { listAdminUsers, createAdminUser } from "@/lib/auth/admin-session";

export const dynamic = "force-dynamic";

const CreateUserSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  password: z.string().min(4).max(200),
  role: z.enum(["OWNER", "ADMIN", "EDITOR"]).default("ADMIN"),
  isActive: z.boolean().default(true),
});

/**
 * GET /api/admin/users — list all admin users (OWNER only).
 */
export async function GET() {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "OWNER") {
    return NextResponse.json(
      { error: "Only OWNER can manage users" },
      { status: 403 }
    );
  }
  const users = await listAdminUsers();
  return NextResponse.json({ users });
}

/**
 * POST /api/admin/users — create a new admin user (OWNER only).
 */
export async function POST(req: NextRequest) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "OWNER") {
    return NextResponse.json(
      { error: "Only OWNER can create users" },
      { status: 403 }
    );
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const parsed = CreateUserSchema.safeParse(body);
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
      role: parsed.data.role,
    });
    if (parsed.data.isActive === false) {
      // createAdminUser defaults to active; allow immediate deactivation
      const { setAdminActive } = await import("@/lib/auth/admin-session");
      await setAdminActive(user.id, false);
    }
    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not create user";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
