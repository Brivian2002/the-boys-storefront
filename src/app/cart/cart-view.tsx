"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/stores/cart";
import type { CartLine } from "@/stores/cart";
import { useCartHydrated } from "@/components/cart/cart-provider";
import { formatGHS } from "@/lib/ghana";

export function CartView() {
  const hydrated = useCartHydrated();
  const lines = useCart((s) => s.lines);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);
  const subtotal = useCart((s) => s.subtotal());
  const count = useCart((s) => s.count());

  if (!hydrated) {
    return <CartSkeleton />;
  }

  if (lines.length === 0) {
    return <EmptyBag />;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3 lg:gap-10">
      {/* Line items */}
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-lg border border-teal-500/30 bg-teal-500/5 p-4">
          <p className="text-sm text-foreground leading-relaxed">
            <span className="font-semibold">Pickup is free</span> at our Ashaley
            Botwe atelier in Madina. Delivery fees are calculated at checkout
            based on your region.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          {lines.map((line) => (
            <CartLineRow
              key={`${line.productId}-${JSON.stringify(line.attributes)}`}
              line={line}
              onSetQty={(q) =>
                setQuantity(line.productId, line.attributes, q)
              }
              onRemove={() => remove(line.productId, line.attributes)}
            />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" size="sm">
            <Link href="/shop">
              <ArrowRight className="h-4 w-4 mr-1.5 rotate-180" />
              Continue shopping
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm("Clear all items from your bag?")) clear();
            }}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Clear bag
          </Button>
        </div>
      </div>

      {/* Summary */}
      <aside className="lg:col-span-1">
        <div className="lg:sticky lg:top-24 rounded-lg border border-border bg-card p-6 space-y-4">
          <h2 className="font-serif text-xl font-semibold">Order summary</h2>
          <Separator />
          <div className="space-y-2.5 text-sm">
            <Row
              label={`Subtotal (${count} ${count === 1 ? "item" : "items"})`}
              value={formatGHS(subtotal)}
            />
            <Row
              label="Delivery"
              value={
                <span className="text-muted-foreground">
                  Calculated at checkout
                </span>
              }
            />
          </div>
          <Separator />
          <div className="flex items-baseline justify-between">
            <span className="font-medium">Estimated total</span>
            <span className="font-serif text-2xl font-semibold">
              {formatGHS(subtotal)}
            </span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Subtotal shown for display only — final total (including delivery
            and any price updates) is confirmed at checkout. You&apos;ll be
            redirected to Paystack&apos;s secure checkout to complete payment.
          </p>

          <Button asChild size="lg" className="w-full h-12 text-base">
            <Link href="/checkout">
              Proceed to checkout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <div className="grid grid-cols-3 gap-2 pt-2 text-center">
            <MiniTrust icon={ShieldCheck} label="Secure" />
            <MiniTrust icon={Truck} label="Ghana-wide" />
            <MiniTrust icon={Sparkles} label="Authentic" />
          </div>
        </div>
      </aside>
    </div>
  );
}

function CartLineRow({
  line,
  onSetQty,
  onRemove,
}: {
  line: CartLine;
  onSetQty: (q: number) => void;
  onRemove: () => void;
}) {
  const attrEntries = Object.entries(line.attributes);
  return (
    <div className="flex gap-4 p-4 sm:p-5">
      <Link
        href={`/shop/${line.slug}`}
        className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-md border border-border bg-muted"
      >
        <Image
          src={line.image}
          alt={line.name}
          fill
          sizes="112px"
          className="object-cover"
        />
      </Link>
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/shop/${line.slug}`}
              className="font-medium text-sm sm:text-base hover:text-primary transition-colors line-clamp-2"
            >
              {line.name}
            </Link>
            {attrEntries.length > 0 && (
              <dl className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                {attrEntries.map(([k, v]) => (
                  <div key={k} className="flex gap-1">
                    <dt className="font-medium text-muted-foreground/80">{k}:</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            aria-label={`Remove ${line.name} from bag`}
            className="h-8 w-8 -mr-1 -mt-1 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-auto flex items-end justify-between pt-3">
          <div className="flex items-center rounded-md border border-border">
            <button
              type="button"
              onClick={() => onSetQty(line.quantity - 1)}
              disabled={line.quantity <= 1}
              className="inline-flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
              aria-label={`Decrease quantity of ${line.name}`}
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-9 text-center text-sm tabular-nums">
              {line.quantity}
            </span>
            <button
              type="button"
              onClick={() => onSetQty(line.quantity + 1)}
              disabled={line.quantity >= 99}
              className="inline-flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
              aria-label={`Increase quantity of ${line.name}`}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="text-right">
            <p className="font-semibold text-sm sm:text-base">
              {formatGHS(line.unitPrice * line.quantity, line.currency)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatGHS(line.unitPrice, line.currency)} each
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground text-right">{value}</span>
    </div>
  );
}

function MiniTrust({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-[0.7rem] text-muted-foreground">
      <Icon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
      <span>{label}</span>
    </div>
  );
}

function EmptyBag() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 sm:py-24 px-4">
      <div className="mb-5 inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <ShoppingBag className="h-8 w-8" />
      </div>
      <h2 className="font-serif text-2xl sm:text-3xl font-semibold mb-2">
        Your bag is empty
      </h2>
      <p className="text-muted-foreground max-w-md mb-7">
        Looks like you haven&apos;t added anything yet. Explore the collection
        and find a piece worth keeping.
      </p>
      <Button asChild size="lg" className="text-base">
        <Link href="/shop">
          Shop the collection
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-3 lg:gap-10">
      <div className="lg:col-span-2 space-y-4">
        <Skeleton className="h-16 w-full rounded-lg" />
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
      <div className="lg:col-span-1">
        <Skeleton className="h-72 w-full rounded-lg" />
      </div>
    </div>
  );
}
