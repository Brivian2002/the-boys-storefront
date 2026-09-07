"use client";

import * as React from "react";
import { toast } from "sonner";
import { Star, Loader2, Trash2, CheckCircle2, Plus } from "lucide-react";

import type { PublishedReview } from "@/lib/reviews/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReviewsManagerProps {
  reviews: PublishedReview[];
  stats: { count: number; average: number };
}

export function ReviewsManager({ reviews: initial, stats }: ReviewsManagerProps) {
  const [reviews, setReviews] = React.useState(initial);
  const [busy, setBusy] = React.useState<string | null>(null);

  // New review form
  const [author, setAuthor] = React.useState("");
  const [rating, setRating] = React.useState(5);
  const [text, setText] = React.useState("");
  const [source, setSource] = React.useState("internal");
  const [adding, setAdding] = React.useState(false);

  const remove = async (id: string) => {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success("Review deleted");
    } catch {
      toast.error("Could not delete review");
    } finally {
      setBusy(null);
    }
  };

  const togglePublished = async (id: string, published: boolean) => {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: published }),
      });
      if (!res.ok) throw new Error("Update failed");
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...(!published ? { ...r } : r) } : r))
      );
      toast.success(published ? "Review published" : "Review hidden");
    } catch {
      toast.error("Could not update review");
    } finally {
      setBusy(null);
    }
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !text.trim()) {
      toast.error("Author and text are required");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: author.trim(),
          rating,
          text: text.trim(),
          source,
          isVerified: true,
          isPublished: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Create failed");
      setReviews((prev) => [
        {
          id: data.id,
          authorName: author.trim(),
          rating,
          text: text.trim(),
          source,
          isVerified: true,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setAuthor("");
      setText("");
      setRating(5);
      toast.success("Review added");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Create failed";
      toast.error("Could not add review", { description: msg });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>
            {stats.count} published review{stats.count === 1 ? "" : "s"} ·
            average {stats.average || "—"} / 5
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Reviews are shown publicly only when at least one is published.
            Internal reviews are authored here; Google reviews are mirrored
            from your Google Business profile.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add a review</CardTitle>
          <CardDescription>
            Manually add a customer review or mirror a Google review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={add} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="author">Author name</Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Ama O."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger id="source">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="rating">Rating</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    aria-label={`${n} stars`}
                    className="p-0.5"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        n <= rating
                          ? "fill-gold text-gold"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="text">Review text</Label>
              <Textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                placeholder="What the customer said..."
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={adding}>
                {adding ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add review
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All reviews</CardTitle>
          <CardDescription>
            {reviews.length} review{reviews.length === 1 ? "" : "s"} in the database.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {reviews.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No reviews yet. Add one above.
            </p>
          )}
          {reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-md border border-border bg-muted/30 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{r.authorName}</p>
                    {r.isVerified && (
                      <Badge variant="secondary" className="gap-1 text-[0.65rem]">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[0.65rem]">
                      {r.source}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`h-3.5 w-3.5 ${
                          n <= r.rating ? "fill-gold text-gold" : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePublished(r.id, false)}
                    disabled={busy === r.id}
                  >
                    Hide
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => remove(r.id)}
                    disabled={busy === r.id}
                    aria-label="Delete review"
                  >
                    {busy === r.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <p className="mt-2 text-sm text-foreground/90">{r.text}</p>
              <p className="mt-2 text-[0.7rem] text-muted-foreground">
                {new Date(r.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
