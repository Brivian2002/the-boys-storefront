"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useCart } from "@/stores/cart";
import { toast } from "sonner";
import type { Product } from "@/lib/blogger/types";

interface AddToBagProps {
  product: Product;
}

/**
 * Manages selected custom attributes + quantity, then adds to the cart store.
 * Calls useCart.add and shows a success toast with a "View bag" link.
 */
export function AddToBag({ product }: AddToBagProps) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const sold = product.availability === "sold-out";

  // Default each attribute to its first value
  const [attributes, setAttributes] = React.useState<Record<string, string>>(
    () => {
      const init: Record<string, string> = {};
      for (const a of product.attributes) {
        if (a.values.length) init[a.name] = a.values[0];
      }
      return init;
    }
  );
  const [qty, setQty] = React.useState(1);
  const [adding, setAdding] = React.useState(false);

  const setAttr = (name: string, value: string) =>
    setAttributes((prev) => ({ ...prev, [name]: value }));

  function handleAdd() {
    if (sold) return;
    setAdding(true);
    try {
      add(
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          image: product.images[0]?.url ?? "/products/placeholder.jpg",
          unitPrice: product.price,
          currency: product.currency,
          attributes,
        },
        qty
      );
      toast.success("Added to bag", {
        description: `${qty} × ${product.name}`,
        action: {
          label: "View bag",
          onClick: () => {
            router.push("/cart");
          },
        },
      });
    } finally {
      // small delay so the button shows feedback
      setTimeout(() => setAdding(false), 250);
    }
  }

  return (
    <div className="space-y-5">
      {/* Attribute selectors */}
      {product.attributes.length > 0 && (
        <div className="space-y-4">
          {product.attributes.map((attr) => (
            <div key={attr.name} className="space-y-2">
              <div className="flex items-baseline justify-between">
                <Label className="text-sm font-medium">
                  {attr.name}
                  <span className="ml-2 text-muted-foreground font-normal">
                    {attributes[attr.name] ?? "—"}
                  </span>
                </Label>
              </div>
              {attr.values.length <= 4 ? (
                <div className="flex flex-wrap gap-2">
                  {attr.values.map((value) => {
                    const selected = attributes[attr.name] === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setAttr(attr.name, value)}
                        aria-pressed={selected}
                        className={cn(
                          "min-h-[44px] min-w-[44px] rounded-md border px-3 py-2 text-sm transition-all",
                          selected
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-background hover:border-foreground/50"
                        )}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {attr.values.map((value) => {
                    const selected = attributes[attr.name] === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setAttr(attr.name, value)}
                        aria-pressed={selected}
                        className={cn(
                          "rounded-md border px-3 py-1.5 text-sm transition-all",
                          selected
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-background hover:border-foreground/50"
                        )}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quantity stepper */}
      <div className="flex items-center gap-3">
        <Label htmlFor="qty" className="text-sm font-medium">
          Quantity
        </Label>
        <div className="flex items-center rounded-md border border-border">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            className="inline-flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <input
            id="qty"
            type="number"
            min={1}
            value={qty}
            onChange={(e) =>
              setQty(Math.max(1, Math.min(99, Number(e.target.value) || 1)))
            }
            className="h-10 w-12 border-x border-border bg-transparent text-center text-sm tabular-nums focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            disabled={qty >= 99}
            className="inline-flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col gap-2.5">
        <Button
          type="button"
          size="lg"
          onClick={handleAdd}
          disabled={sold || adding}
          className="w-full h-12 text-base"
        >
          {adding ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : sold ? null : (
            <ShoppingBag className="h-4 w-4 mr-2" />
          )}
          {sold
            ? "Sold out"
            : adding
            ? "Adding..."
            : "Add to bag"}
        </Button>
        {!sold && (
          <Button asChild variant="outline" size="lg" className="h-12 text-base">
            <Link href="/cart">
              <Check className="h-4 w-4 mr-2" />
              View bag &amp; checkout
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
