"use client";

import * as React from "react";
import { toast } from "sonner";
import { ArrowRight, Gem, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

const STORAGE_KEY = "boys-store-awareness-seen-v2";

function AwarenessCard({
  icon: Icon,
  eyebrow,
  title,
  children,
  accent = "teal",
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  accent?: "teal" | "amber";
  action?: React.ReactNode;
}) {
  return (
    <div className="w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-2xl">
      <div className="flex items-start gap-3">
        <span
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            accent === "amber"
              ? "bg-amber-400/20 text-amber-700 dark:text-amber-300"
              : "bg-blue-600/15 text-teal-700 dark:text-blue-300"
          }`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {eyebrow}
          </p>
          <p className="mt-1 font-serif text-lg font-semibold leading-tight">{title}</p>
          <div className="mt-2 text-xs leading-relaxed text-muted-foreground">{children}</div>
          {action}
        </div>
      </div>
    </div>
  );
}

export function AwarenessToasts() {
  React.useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") return;
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // If storage is unavailable, the experience still works for this visit.
    }

    const first = window.setTimeout(() => {
      toast.custom(
        () => (
          <AwarenessCard icon={Gem} eyebrow="Welcome to The Boyz Store" title="Useful finds, ready to go.">
            Discover useful products and dependable services from a marketplace built around everyday needs.
            <div className="mt-3">
              <Link href="/shop" className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:underline dark:text-blue-300">
                Explore the collection <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </AwarenessCard>
        ),
        { duration: 9500, position: "bottom-center", className: "!mb-20 sm:!mb-4", id: "boys-store-welcome" },
      );
    }, 1200);

    const second = window.setTimeout(() => {
      toast.custom(
        () => (
          <AwarenessCard icon={ShieldCheck} eyebrow="A little clarity" title="Two names, one trusted business." accent="amber">
            <strong className="text-amber-700 dark:text-amber-300">The Boyz Store</strong> is our customer-facing brand. The registered business behind it is <strong className="text-amber-700 dark:text-amber-300">The Boyz Store Marketplace</strong>.
            <div className="mt-3">
              <Link href="/policies#terms" className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:underline dark:text-blue-300">
                Learn more in our policies <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </AwarenessCard>
        ),
        { duration: 11000, position: "bottom-center", className: "!mb-20 sm:!mb-4", id: "boys-store-legal-identity" },
      );
    }, 6200);

    const third = window.setTimeout(() => {
      toast.custom(
        () => (
          <AwarenessCard icon={Sparkles} eyebrow="Need a guide?" title="Ask our The Boyz Store assistant.">
            Get quick answers about our story, materials, delivery, payments, care, and the difference between our trading brand and registered business.
          </AwarenessCard>
        ),
        { duration: 8500, position: "bottom-center", className: "!mb-20 sm:!mb-4", id: "boys-store-assistant-intro" },
      );
    }, 12500);

    return () => {
      window.clearTimeout(first);
      window.clearTimeout(second);
      window.clearTimeout(third);
    };
  }, []);

  return null;
}
