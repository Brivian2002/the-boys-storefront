"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Save, Loader2, ExternalLink, RotateCcw } from "lucide-react";

import type { Category } from "@/lib/blogger/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CategoryEditorProps {
  categoryKey: Category;
  label: string;
  defaultDescription: string;
  /** persisted description override (loaded from the SiteSetting table) */
  initialDescription?: string;
}

/**
 * Category copy editor.
 *
 * Persists to /api/admin/categories (the SiteSetting table) — NO localStorage.
 * The merchandising copy field is stored alongside the description under the
 * same category key.
 */
export function CategoryEditor({
  categoryKey,
  label,
  defaultDescription,
  initialDescription,
}: CategoryEditorProps) {
  const [description, setDescription] = React.useState(
    initialDescription ?? defaultDescription
  );
  const [merch, setMerch] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  // Load any persisted merchandising copy on mount.
  React.useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/categories?key=${encodeURIComponent(categoryKey)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.merchandising) setMerch(data.merchandising);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [categoryKey]);

  const save = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryKey,
          label,
          description,
          merchandising: merch,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Save failed");
      toast.success(`Saved "${label}" copy`, {
        description: "Stored in the database.",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      toast.error("Could not save", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    setDescription(defaultDescription);
    setMerch("");
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/categories/${encodeURIComponent(categoryKey)}`,
        { method: "DELETE" }
      );
      if (!res.ok && res.status !== 404) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error ?? "Reset failed");
      }
      toast.success(`Reset "${label}" to defaults`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Reset failed";
      toast.error("Could not reset", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>{label}</CardTitle>
          <CardDescription className="font-mono text-[0.7rem]">
            category-{categoryKey}
          </CardDescription>
        </div>
        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
          <Link
            href={`/shop?category=${categoryKey}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View ${label} on store`}
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`desc-${categoryKey}`}>Short description</Label>
          <Textarea
            id={`desc-${categoryKey}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Short description shown above the product grid."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`merch-${categoryKey}`}>Merchandising copy</Label>
          <Textarea
            id={`merch-${categoryKey}`}
            value={merch}
            onChange={(e) => setMerch(e.target.value)}
            rows={4}
            placeholder="Longer narrative copy for the category landing experience."
          />
        </div>
        <div className="flex gap-2">
          <Button type="button" size="sm" onClick={save} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={reset}
            disabled={loading}
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
