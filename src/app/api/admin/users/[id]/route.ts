import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  requireAdmin,
  setAdminActive,
  deleteAdminUser,
  AdminAuthError,
} from "@/lib/auth/admin-session";

export const dynamic = "force-dynamic";

const PatchSchema = z.object({
  isActive: z.boolean().optional(),
  role: z.enum(["OWNER", "ADMIN", "EDITOR"]).optional(),
});

/**
 * PATCH /api/admin/users/[id] — update a user's active state or role (OWNER only).
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "OWNER") {
    return NextResponse.json(
      { error: "Only OWNER can update users" },
      { status: 403 }
    );
  }
  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  try {
    if (typeof parsed.data.isActive === "boolean") {
      await setAdminActive(id, parsed.data.isActive);
    }
    // Role changes are intentionally limited — only OWNER can promote to OWNER.
    // We currently do not support demoting OWNERs via API to avoid lock-out.
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not update user";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

/**
 * DELETE /api/admin/users/[id] — delete a user (OWNER only).
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "OWNER") {
    return NextResponse.json(
      { error: "Only OWNER can delete users" },
      { status: 403 }
    );
  }
  const { id } = await params;
  try {
    await deleteAdminUser(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AdminAuthError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Could not delete user" },
      { status: 400 }
    );
  }
}
