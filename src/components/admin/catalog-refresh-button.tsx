"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface CatalogStatus {
  source: "blogger" | "empty";
  fresh: boolean;
  total: number;
  published: number;
  draft: number;
  hidden: number;
  lastFetched: number;
  bloggerConfigured: boolean;
}

export function CatalogRefreshButton({
  onRefreshed,
}: {
  onRefreshed?: (status: CatalogStatus) => void;
}) {
  const [loading, setLoading] = React.useState(false);

  const handle = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/catalog/refresh", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Refresh failed");
      toast.success("Catalog refreshed", {
        description:
          data?.status?.source === "blogger"
            ? "Pulled latest from Blogger."
            : "No Blogger catalog is configured yet.",
      });
      onRefreshed?.(data.status as CatalogStatus);
    } catch (err) {
      toast.error("Refresh failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handle} disabled={loading} variant="outline" size="sm">
      <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Refreshing..." : "Refresh catalog now"}
    </Button>
  );
}

export function CatalogStatusBadge({ status }: { status: CatalogStatus }) {
  if (status.source === "blogger") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Live (Blogger)
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
      <AlertCircle className="h-3.5 w-3.5" />
      Awaiting Blogger
    </span>
  );
}
