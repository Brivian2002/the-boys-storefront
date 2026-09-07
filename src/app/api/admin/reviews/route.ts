import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin-session";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const CreateReviewSchema = z.object({
  authorName: z.string().min(1).max(120),
  rating: z.number().int().min(1).max(5).default(5),
  text: z.string().min(1).max(2000),
  source: z.string().max(40).default("internal"),
  isVerified: z.boolean().default(false),
  isPublished: z.boolean().default(true),
});

/**
 * GET /api/admin/reviews — list all reviews (admin view, including unpublished).
 */
export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const reviews = await db.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  return NextResponse.json({
    reviews: reviews.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}

/**
 * POST /api/admin/reviews — create a review (admin-added).
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const parsed = CreateReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const review = await db.review.create({
    data: {
      authorName: parsed.data.authorName,
      rating: parsed.data.rating,
      text: parsed.data.text,
      source: parsed.data.source,
      isVerified: parsed.data.isVerified,
      isPublished: parsed.data.isPublished,
    },
  });
  return NextResponse.json(
    {
      review: {
        ...review,
        createdAt: review.createdAt.toISOString(),
      },
    },
    { status: 201 }
  );
}
