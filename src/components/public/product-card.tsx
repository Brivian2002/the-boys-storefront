"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/stores/cart";
import { toast } from "sonner";
import { ShoppingBag, Eye } from "lucide-react";
import { AVAILABILITY_LABELS, BADGE_LABELS } from "@/lib/blogger/types";
import { formatGHS as fmtGHS } from "@/lib/ghana";
import type { Product } from "@/lib/blogger/types";

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
}

export function ProductCard({ product, className, priority }: ProductCardProps) {
  const add = useCart((s) => s.add);
  const [imgLoaded, setImgLoaded] = React.useState(false);
  const sold = product.availability === "sold-out";

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (sold) return;
    // quick-add uses default first attribute value where required
    const attrs: Record<string, string> = {};
    for (const a of product.attributes) {
      if (a.values.length) attrs[a.name] = a.values[0];
    }
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0]?.url ?? "/products/placeholder.jpg",
      unitPrice: product.price,
      currency: product.currency,
      attributes: attrs,
    });
    toast.success("Added to bag", { description: product.name });
  };

  return (
    <Link
      href={`/shop/${product.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
        className
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {!imgLoaded && (
          <div className="absolute inset-0 shimmer" aria-hidden="true" />
        )}
        {product.images[0]?.url && (
          <Image
            src={product.images[0].url}
            alt={product.images[0].alt ?? product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-cover transition-all duration-700 group-hover:scale-105",
              imgLoaded ? "opacity-100" : "opacity-0",
              sold && "grayscale-[0.4]"
            )}
            onLoad={() => setImgLoaded(true)}
            onError={(event) => {
              setImgLoaded(true);
              event.currentTarget.style.opacity = "0";
            }}
            unoptimized
            priority={priority}
          />
        )}
        {/* badges */}
        {product.badges.length > 0 && (
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {product.badges.slice(0, 2).map((b) => (
              <Badge
                key={b}
                variant={b === "sale" ? "destructive" : "secondary"}
                className={cn(
                  "backdrop-blur-sm text-[0.65rem] px-2 py-0.5",
                  b === "sale"
                    ? "bg-destructive text-destructive-foreground"
                    : b === "new-arrival"
                    ? "bg-primary text-primary-foreground"
                    : b === "exclusive"
                    ? "bg-foreground text-background"
                    : "bg-gold text-black"
                )}
              >
                {BADGE_LABELS[b]}
              </Badge>
            ))}
          </div>
        )}
        {sold && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-full bg-foreground/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-background backdrop-blur-sm">
              {AVAILABILITY_LABELS[product.availability]}
            </span>
          </div>
        )}
        {/* quick actions */}
        <div className="absolute right-2 bottom-2 flex gap-1.5 opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 glass"
            onClick={quickAdd}
            disabled={sold}
            aria-label="Quick add to bag"
            title="Quick add"
          >
            <ShoppingBag className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 glass"
            asChild
          >
            <span aria-label="View details" title="View details">
              <Eye className="h-4 w-4" />
            </span>
          </Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">
              {product.collection ?? product.material}
            </p>
            <h3 className="mt-0.5 font-medium text-sm leading-snug truncate group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-semibold text-foreground">
            {fmtGHS(product.price, product.currency)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-muted-foreground line-through">
              {fmtGHS(product.originalPrice, product.currency)}
            </span>
          )}
        </div>
        {product.availability === "limited" && (
          <p className="mt-1 text-[0.7rem] text-amber-600 dark:text-amber-400 font-medium">
            {AVAILABILITY_LABELS.limited}
          </p>
        )}
      </div>
    </Link>
  );
}
