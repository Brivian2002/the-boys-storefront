"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/lib/blogger/types";

interface ProductGalleryProps {
  images: ProductImage[];
  name: string;
}

/**
 * Image gallery for the product detail page. Main image + thumbnail strip,
 * with a soft zoom-on-hover for the main image (desktop only).
 */
export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeIdx, setActiveIdx] = React.useState(0);
  const safeImages = images.length > 0 ? images : [{ url: "/products/placeholder.jpg", alt: name }];

  const active = safeImages[activeIdx] ?? safeImages[0];

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
        <Image
          key={active.url}
          src={active.url}
          alt={active.alt ?? name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          unoptimized
          onError={(event) => {
            event.currentTarget.style.opacity = "0";
          }}
        />
      </div>

      {/* Thumbnails */}
      {safeImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {safeImages.map((img, idx) => (
            <button
              key={`${img.url}-${idx}`}
              type="button"
              onClick={() => setActiveIdx(idx)}
              aria-label={`View image ${idx + 1} of ${safeImages.length}`}
              aria-pressed={idx === activeIdx}
              className={cn(
                "relative aspect-square overflow-hidden rounded-md border bg-muted transition-all",
                idx === activeIdx
                  ? "border-foreground ring-1 ring-foreground"
                  : "border-border hover:border-foreground/40"
              )}
            >
              <Image
                src={img.url}
                alt={img.alt ?? `${name} thumbnail ${idx + 1}`}
                fill
                sizes="(max-width: 640px) 20vw, 100px"
                className="object-cover"
                unoptimized
                onError={(event) => {
                  event.currentTarget.style.opacity = "0";
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
