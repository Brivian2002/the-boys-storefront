/**
 * Reviews client.
 *
 * Reads published reviews from the DB (Review table). Reviews may come from
 * internal submissions or be mirrored from Google. The public widget only
 * renders when at least one published review exists — never fabricates
 * testimonials.
 */

import "server-only";
import { db } from "@/lib/db";

export interface PublishedReview {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  source: string;
  isVerified: boolean;
  createdAt: string;
}

export interface ReviewStats {
  count: number;
  average: number;
  distribution: Record<number, number>;
}

export async function getPublishedReviews(limit = 12): Promise<PublishedReview[]> {
  const rows = await db.review.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map((r) => ({
    id: r.id,
    authorName: r.authorName,
    rating: r.rating,
    text: r.text,
    source: r.source,
    isVerified: r.isVerified,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getReviewStats(): Promise<ReviewStats> {
  const rows = await db.review.findMany({
    where: { isPublished: true },
    select: { rating: true },
  });
  const count = rows.length;
  const sum = rows.reduce((s, r) => s + r.rating, 0);
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of rows) {
    distribution[r.rating] = (distribution[r.rating] ?? 0) + 1;
  }
  return {
    count,
    average: count ? Math.round((sum / count) * 10) / 10 : 0,
    distribution,
  };
}
