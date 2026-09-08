"use client";

import * as React from "react";
import { Instagram, Facebook, X } from "lucide-react";

interface SocialPopupProps {
  instagram?: string;
  facebook?: string;
}

/**
 * Compact bottom-right social popup with live animations.
 *
 * - Appears after a short delay with a slide-up + fade-in.
 * - Auto-hides after 60s.
 * - Pauses the auto-hide timer on hover/focus.
 * - Dismissible; the dismissal is remembered for the session.
 * - Keyboard accessible (focusable, Esc to close).
 * - Instagram button uses the real Instagram gradient.
 * - Facebook button uses the real Facebook blue (#1877F2).
 */
export function SocialPopup({ instagram, facebook }: SocialPopupProps) {
  const [open, setOpen] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);
  const [pulse, setPulse] = React.useState(false);
  const [profileImage, setProfileImage] = React.useState(
    "https://unavatar.io/instagram/_laglitzj"
  );

  React.useEffect(() => {
    if (!instagram && !facebook) return;
    try {
      if (sessionStorage.getItem("laglitz-social-dismissed") === "1") {
        // Read the session-only dismissal flag after entering the browser.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDismissed(true);
        return;
      }
    } catch {
      /* ignore */
    }
    const showTimer = window.setTimeout(() => setOpen(true), 4000);
    // Start a subtle pulse animation on the popup after it appears
    const pulseTimer = window.setTimeout(() => setPulse(true), 6000);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(pulseTimer);
    };
  }, [instagram, facebook]);

  // Auto-hide after 60s, paused on hover/focus
  const hideTimeoutRef = React.useRef<number | null>(null);
  const pausedRef = React.useRef(false);

  const scheduleHide = React.useCallback(() => {
    if (hideTimeoutRef.current) window.clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = window.setTimeout(() => {
      if (!pausedRef.current) setOpen(false);
    }, 60_000);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    scheduleHide();
    return () => {
      if (hideTimeoutRef.current) window.clearTimeout(hideTimeoutRef.current);
    };
  }, [open, scheduleHide]);

  const dismiss = () => {
    setOpen(false);
    setDismissed(true);
    try {
      sessionStorage.setItem("laglitz-social-dismissed", "1");
    } catch {
      /* ignore */
    }
  };

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (dismissed || !open || (!instagram && !facebook)) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-card p-4 shadow-2xl transition-all duration-500 ${
        open ? "animate-fade-up translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      } ${pulse ? "animate-pulse-once" : ""}`}
      role="dialog"
      aria-label="Follow us on social media"
      onMouseEnter={() => {
        pausedRef.current = true;
        setPulse(false);
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
        scheduleHide();
      }}
      onFocus={() => {
        pausedRef.current = true;
        setPulse(false);
      }}
      onBlur={() => {
        pausedRef.current = false;
        scheduleHide();
      }}
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Close"
        className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:rotate-90 hover:bg-muted hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="flex items-center gap-2 mb-2 pr-6">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 animate-scale-in ring-2 ring-pink-400/30">
          <img
            src={profileImage}
            alt="LaGlitz Instagram profile"
            className="h-full w-full object-cover"
            onError={() => setProfileImage("/founder-avatar.png")}
          />
        </span>
        <p className="text-sm font-semibold text-foreground">
          Follow the journey
        </p>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
        See new pieces, behind-the-bench stories and customer moments on social.
      </p>

      <div className="flex gap-2">
        {instagram && (
          <a
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] px-3 py-2.5 text-xs font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
          >
            <Instagram className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
            Instagram
          </a>
        )}
        {facebook && (
          <a
            href={facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#1877F2] px-3 py-2.5 text-xs font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-[#166FE5] hover:shadow-lg active:scale-95"
          >
            <Facebook className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-6" />
            Facebook
          </a>
        )}
      </div>
    </div>
  );
}
