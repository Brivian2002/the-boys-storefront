import * as React from "react";

interface BrandLogoProps {
  className?: string;
  showWordmark?: boolean;
  variant?: "default" | "light";
}

/**
 * LA GLITZ brand logo - diamond monogram + wordmark.
 * Uses currentColor for the wordmark so it adapts to theme.
 */
export function BrandLogo({ className, showWordmark = true, variant = "default" }: BrandLogoProps) {
  const wordColor = variant === "light" ? "#fff" : "currentColor";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <svg
        viewBox="0 0 56 56"
        className="h-8 w-8 shrink-0"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="lg-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.82 0.15 85)" />
            <stop offset="50%" stopColor="oklch(0.88 0.13 80)" />
            <stop offset="100%" stopColor="oklch(0.62 0.13 75)" />
          </linearGradient>
        </defs>
        <path d="M28 2 L52 28 L28 54 L4 28 Z" fill="url(#lg-gold)" />
        <path d="M28 8 L46 28 L28 48 L10 28 Z" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="0.8" />
        <text
          x="28"
          y="35"
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontSize="18"
          fontWeight="700"
          fill="#1a1a1a"
          letterSpacing="-1"
        >
          LG
        </text>
      </svg>
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className="font-serif text-lg font-semibold tracking-[0.25em]"
            style={{ color: wordColor }}
          >
            LA GLITZ
          </span>
          <span className="mt-1 text-[0.55rem] font-medium uppercase tracking-[0.4em] text-gold">
            Accra · Ghana
          </span>
        </span>
      )}
    </span>
  );
}
