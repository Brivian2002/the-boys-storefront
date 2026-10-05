import * as React from "react";
import Image from "next/image";

interface BrandLogoProps {
  className?: string;
  showWordmark?: boolean;
  variant?: "default" | "light";
}

/**
 * The Boys Store brand logo.
 *
 * Uses the custom /brand/logo.svg shopping-basket mark, with a two-line wordmark:
 *   "The Boys Store" (serif, primary)
 *   "Joshua Nasi Words · Marketplace" (uppercase, turquoise tagline)
 *
 * `variant="light"` forces the wordmark white (for dark hero overlays).
 */
export function BrandLogo({
  className,
  showWordmark = true,
  variant = "default",
}: BrandLogoProps) {
  const wordColor = variant === "light" ? "#fff" : "currentColor";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <Image
        src="/brand/logo.svg"
        alt="The Boys Store"
        width={40}
        height={40}
        className="h-9 w-9 shrink-0 rounded-xl object-cover ring-1 ring-sky-200"
        priority
      />
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className="font-serif text-base font-semibold tracking-tight sm:text-lg"
            style={{ color: wordColor }}
          >
            The Boys Store
          </span>
          <span className="mt-1 text-[0.6rem] font-medium uppercase tracking-[0.32em] text-sky-600">
            Joshua Nasi Words · Marketplace
          </span>
        </span>
      )}
    </span>
  );
}
