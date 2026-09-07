import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin-session";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const PatchSchema = z.object({
  authorName: z.string().min(1).max(120).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  text: z.string().min(1).max(2000).optional(),
  isVerified: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

/**
 * PATCH /api/admin/reviews/[id] — update a review.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    const review = await db.review.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json({
      review: {
        ...review,
        createdAt: review.createdAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

/**
 * DELETE /api/admin/reviews/[id] — delete a review.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    await db.review.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
