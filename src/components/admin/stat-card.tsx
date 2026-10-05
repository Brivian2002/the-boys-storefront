import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: "default" | "success" | "warning" | "muted";
  className?: string;
}

const toneStyles: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "bg-card ring-1 ring-white/[0.06]",
  success: "bg-card ring-1 ring-emerald-400/30",
  warning: "bg-card ring-1 ring-amber-300/30",
  muted: "bg-muted/40 ring-1 ring-white/[0.04]",
};

export function StatCard({ label, value, hint, icon: Icon, tone = "default", className }: StatCardProps) {
  return (
    <Card className={cn("py-4 transition-all duration-200 hover:-translate-y-0.5 hover:ring-primary/30", toneStyles[tone], className)}>
      <CardContent className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {hint && (
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
        {Icon && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Compact pill-style status indicator: green dot for configured,
 * red for not. Never displays the secret value.
 */
export function ConfigStatus({ label, configured }: { label: string; configured: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-2">
      <span className="text-sm text-foreground">{label}</span>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-medium",
          configured ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
        )}
      >
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            configured ? "bg-emerald-500" : "bg-amber-500"
          )}
        />
        {configured ? "Configured" : "Not configured"}
      </span>
    </div>
  );
}
