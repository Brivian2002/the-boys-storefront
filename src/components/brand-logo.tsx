import * as React from "react";
import Image from "next/image";

interface BrandLogoProps {
  className?: string;
  showWordmark?: boolean;
  variant?: "default" | "light";
}

/**
 * Afrocentric Jewelry by LaGlitz brand logo.
 *
 * Uses /brand/logo.png for the mark, with a two-line wordmark:
 *   "Afrocentric Jewelry" (serif, primary)
 *   "by LaGlitz · Africa Arising" (uppercase, turquoise tagline)
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
        src="/brand/logo.png"
        alt="Afrocentric Jewelry by LaGlitz"
        width={40}
        height={40}
        className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-gold/40"
        priority
      />
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className="font-serif text-base font-semibold tracking-tight sm:text-lg"
            style={{ color: wordColor }}
          >
            Afrocentric Jewelry
          </span>
          <span className="mt-1 text-[0.6rem] font-medium uppercase tracking-[0.32em] text-turquoise">
            by LaGlitz · Africa Arising
          </span>
        </span>
      )}
    </span>
  );
}
