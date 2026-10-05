import * as React from "react";
import { getSiteSettings } from "@/lib/site/store";
import { PublicHeader } from "@/components/public/header";
import { PublicFooter } from "@/components/public/footer";
import { SocialPopup } from "@/components/public/social-popup";
import { AwarenessToasts } from "@/components/public/awareness-toasts";
import { AIAssistant } from "@/components/public/ai-assistant";
import { MobileBottomNav } from "@/components/public/mobile-bottom-nav";

/**
 * Public storefront shell.
 *
 * Async server component: fetches site settings once per render and passes
 * the relevant slices down to the header (announcement) and footer (brand,
 * contact, social). Includes the SocialPopup so it appears on every public
 * page.
 */
export async function PublicShell({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const isPlaceholder = (value?: string) =>
    !value ||
    value === "https://www.instagram.com/theboyzstore" ||
    value === "https://www.facebook.com/TheBoysStore/" ||
    value === "https://wa.me/233200000000";
  const social = {
    ...settings.social,
    instagram: isPlaceholder(settings.social.instagram) ? "" : settings.social.instagram,
    facebook: isPlaceholder(settings.social.facebook) ? "" : settings.social.facebook,
    whatsapp: isPlaceholder(settings.social.whatsapp) ? "" : settings.social.whatsapp,
  };
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader announcement={settings.announcement} />
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      <PublicFooter
        brand={settings.brand}
        legalBusinessName={settings.legalBusinessName}
        contact={settings.contact}
        social={social}
      />
      <SocialPopup
        instagram={social.instagram || undefined}
        facebook={social.facebook || undefined}
        whatsapp={social.whatsapp || undefined}
      />
      <AwarenessToasts />
      <AIAssistant />
      <MobileBottomNav />
    </div>
  );
}
