"use client";

import * as React from "react";
import { toast } from "sonner";
import { RefreshCw, Loader2, Database, CheckCircle2, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BloggerActionsProps {
  status: {
    source: string;
    fresh: boolean;
    total: number;
    published: number;
    draft: number;
    hidden: number;
    lastFetched: number;
    bloggerConfigured: boolean;
  };
}

export function BloggerActions({ status }: BloggerActionsProps) {
  const [refreshing, setRefreshing] = React.useState(false);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/catalog/refresh", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Refresh failed");
      toast.success("Catalog refreshed", {
        description: `Pulled ${data.count ?? 0} products from Blogger.`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Refresh failed";
      toast.error("Refresh failed", { description: msg });
    } finally {
      setRefreshing(false);
    }
  };

  const lastFetchedStr = status.lastFetched
    ? new Date(status.lastFetched).toLocaleString()
    : "never";

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Blogger database
          </CardTitle>
          <CardDescription>
            Product catalog source. Blogger is the source of truth; the DB
            cache is refreshed periodically and on demand.
          </CardDescription>
        </div>
        <Button onClick={refresh} disabled={refreshing || !status.bloggerConfigured}>
          {refreshing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Refresh now
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Total" value={status.total} />
          <Stat label="Published" value={status.published} />
          <Stat label="Draft" value={status.draft} />
          <Stat label="Hidden" value={status.hidden} />
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Badge variant={status.bloggerConfigured ? "default" : "secondary"}>
            {status.bloggerConfigured ? (
              <>
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Blogger connected
              </>
            ) : (
              <>
                <AlertTriangle className="mr-1 h-3 w-3" />
                Not configured
              </>
            )}
          </Badge>
          <Badge variant={status.fresh ? "outline" : "secondary"}>
            {status.fresh ? "Cache fresh" : "Cache stale"}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Source: {status.source} · Last fetched: {lastFetchedStr}
          </span>
        </div>
        {!status.bloggerConfigured && (
          <p className="rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
            Blogger credentials are not configured. Add{" "}
            <code className="font-mono">BLOGGER_BLOG_ID</code> and either{" "}
            <code className="font-mono">BLOGGER_API_KEY</code> or the Google
            OAuth refresh-token set to enable live reads. The DB cache is the
            only source until then.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-3">
      <p className="text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-serif text-xl font-semibold">{value}</p>
    </div>
  );
}
