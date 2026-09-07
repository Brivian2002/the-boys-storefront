import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/admin-session";
import { AdminShell } from "@/components/admin/admin-shell";
import { ReviewsManager } from "@/components/admin/reviews-manager";
import { db } from "@/lib/db";
import { getReviewStats } from "@/lib/reviews/client";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const [rows, stats] = await Promise.all([
    db.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
    getReviewStats(),
  ]);
  const reviews = rows.map((r) => ({
    id: r.id,
    authorName: r.authorName,
    rating: r.rating,
    text: r.text,
    source: r.source,
    isVerified: r.isVerified,
    isPublished: r.isPublished,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <AdminShell
      active="reviews"
      title="Reviews"
      description="Approve, edit and publish customer reviews"
      session={session}
    >
      <ReviewsManager reviews={reviews} stats={stats} />
    </AdminShell>
  );
}
