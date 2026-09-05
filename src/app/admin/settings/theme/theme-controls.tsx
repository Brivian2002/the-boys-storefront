"use client";

import * as React from "react";
import { Check, Sun, Moon, Sparkles, Gem } from "lucide-react";
import { toast } from "sonner";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Badge as UIBadge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ThemeControls() {
  const { palette, theme, setPalette, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      {/* Current state */}
      <Card>
        <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Current active palette
            </p>
            <p className="mt-1 font-serif text-xl font-semibold">
              {palette === "commerce" ? "Bright Commerce" : "Light Luxury"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Mode: <span className="font-medium text-foreground capitalize">{theme}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const next = theme === "dark" ? "light" : "dark";
                setTheme(next);
                toast.success(`Switched to ${next} mode`);
              }}
            >
              {theme === "dark" ? (
                <>
                  <Sun className="h-4 w-4" /> Switch to light
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" /> Switch to dark
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Palette grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <PaletteCard
          active={palette === "commerce"}
          title="Bright Commerce"
          description="Warm orange + sea turquoise + cream. Energetic, retail-forward, high-contrast for checkout."
          swatches={[
            { name: "Primary", color: "bg-[oklch(0.66_0.21_45)]" },
            { name: "Accent", color: "bg-[oklch(0.78_0.13_195)]" },
            { name: "Gold", color: "bg-[oklch(0.78_0.15_85)]" },
            { name: "Surface", color: "bg-[oklch(0.99_0.005_95)] border" },
          ]}
          icon={Sparkles}
          onSelect={() => {
            setPalette("commerce");
            toast.success("Palette: Bright Commerce");
          }}
        />

        <PaletteCard
          active={palette === "luxury"}
          title="Light Luxury"
          description="Ink black + champagne gold + soft cream. Editorial, restrained, premium gallery feel."
          swatches={[
            { name: "Primary", color: "bg-[oklch(0.18_0.012_240)]" },
            { name: "Gold", color: "bg-[oklch(0.78_0.15_85)]" },
            { name: "Cream", color: "bg-[oklch(0.96_0.012_75)] border" },
            { name: "Ink", color: "bg-[oklch(0.14_0.005_240)]" },
          ]}
          icon={Gem}
          onSelect={() => {
            setPalette("luxury");
            toast.success("Palette: Light Luxury");
          }}
        />
      </div>

      {/* Live preview */}
      <Card>
        <CardHeader>
          <CardTitle>Live preview</CardTitle>
          <CardDescription>
            Buttons, badges and headings in the current palette &amp; mode.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Primary button</Button>
            <Button size="sm" variant="outline">Outline</Button>
            <Button size="sm" variant="secondary">Secondary</Button>
            <Button size="sm" variant="ghost">Ghost</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <UIBadge>Featured</UIBadge>
            <UIBadge variant="secondary">New</UIBadge>
            <UIBadge variant="destructive">Sale</UIBadge>
            <UIBadge variant="outline">Bestseller</UIBadge>
          </div>
          <div>
            <h3 className="font-serif text-2xl font-semibold tracking-tight">
              Editorial heading
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Subtle body copy in the muted foreground tone.
            </p>
          </div>
          <div className="rounded-md border border-border bg-card p-4">
            <p className="font-medium">Card surface</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Card background uses <code className="rounded bg-muted px-1">--card</code> token.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="py-4 text-sm">
          <p className="font-medium text-emerald-700 dark:text-emerald-300">
            WCAG AA compliance
          </p>
          <p className="mt-1 text-emerald-700/80 dark:text-emerald-300/80">
            Both palettes meet WCAG AA contrast ratios for body text and interactive
            elements in light and dark modes.
          </p>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Theme preferences are saved to your browser (localStorage) and applied
        site-wide.
      </p>
    </div>
  );
}

interface PaletteCardProps {
  active: boolean;
  title: string;
  description: string;
  swatches: { name: string; color: string }[];
  icon: React.ComponentType<{ className?: string }>;
  onSelect: () => void;
}

function PaletteCard({ active, title, description, swatches, icon: Icon, onSelect }: PaletteCardProps) {
  return (
    <Card
      className={cn(
        "transition-all",
        active ? "ring-2 ring-primary" : "hover:shadow-md"
      )}
    >
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-foreground">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
        </div>
        {active && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
            <Check className="h-3 w-3" /> Active
          </span>
        )}
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-4 gap-2">
          {swatches.map((s) => (
            <div key={s.name} className="space-y-1">
              <div className={cn("h-12 w-full rounded-md", s.color)} />
              <p className="text-center text-[0.65rem] text-muted-foreground">{s.name}</p>
            </div>
          ))}
        </div>
        <Button
          variant={active ? "outline" : "default"}
          size="sm"
          className="w-full"
          onClick={onSelect}
          disabled={active}
        >
          {active ? (
            <>
              <Check className="h-4 w-4" /> Active palette
            </>
          ) : (
            <>Use this palette</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
