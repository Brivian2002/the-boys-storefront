import * as React from "react";
import { Star, Quote } from "lucide-react";
import { getPublishedReviews, getReviewStats } from "@/lib/reviews/client";
import { cn } from "@/lib/utils";

/**
 * Reviews widget.
 *
 * Shows published reviews + an aggregate rating. Renders NOTHING when there
 * are zero published reviews — never fabricates testimonials. The Google "G"
 * logo is shown next to the average to signal the source where applicable.
 */
export async function ReviewsWidget({ limit = 6 }: { limit?: number }) {
  const [reviews, stats] = await Promise.all([
    getPublishedReviews(limit),
    getReviewStats(),
  ]);

  if (reviews.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mb-10 text-center">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          What customers say
        </p>
        <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          Loved by women across Ghana & beyond
        </h2>
        <div className="mt-4 flex items-center justify-center gap-3">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={cn(
                  "h-5 w-5",
                  n <= Math.round(stats.average)
                    ? "fill-gold text-gold"
                    : "text-muted-foreground"
                )}
              />
            ))}
          </div>
          <span className="font-serif text-lg font-semibold">
            {stats.average || "—"}
          </span>
          <span className="text-sm text-muted-foreground">
            · {stats.count} review{stats.count === 1 ? "" : "s"}
          </span>
          <GoogleGLogo className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r) => (
          <figure
            key={r.id}
            className="flex flex-col rounded-lg border border-border bg-card p-5 hover-lift"
          >
            <Quote className="mb-3 h-5 w-5 text-turquoise" />
            <blockquote className="flex-1 text-sm leading-relaxed text-foreground/90">
              {r.text}
            </blockquote>
            <figcaption className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
              <div>
                <p className="text-sm font-medium">{r.authorName}</p>
                <div className="mt-0.5 flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={cn(
                        "h-3 w-3",
                        n <= r.rating
                          ? "fill-gold text-gold"
                          : "text-muted-foreground"
                      )}
                    />
                  ))}
                </div>
              </div>
              {r.source === "google" && (
                <GoogleGLogo className="h-4 w-4" aria-hidden="true" />
              )}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/**
 * Inline Google "G" logo (multicolor), drawn as SVG so it renders without
 * any external asset. Used to mark Google-sourced reviews.
 */
function GoogleGLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label="Google"
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}
