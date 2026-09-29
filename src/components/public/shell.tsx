import * as React from "react";
import { getSiteSettings } from "@/lib/site/store";
import { PublicHeader } from "@/components/public/header";
import { PublicFooter } from "@/components/public/footer";
import { SocialPopup } from "@/components/public/social-popup";
import { AwarenessToasts } from "@/components/public/awareness-toasts";
import { AIAssistant } from "@/components/public/ai-assistant";

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
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader announcement={settings.announcement} />
      <main className="flex-1">{children}</main>
      <PublicFooter
        brand={settings.brand}
        legalBusinessName={settings.legalBusinessName}
        contact={settings.contact}
        social={settings.social}
      />
      <SocialPopup
        instagram={settings.social.instagram}
        facebook={settings.social.facebook}
      />
      <AwarenessToasts />
      <AIAssistant />
    </div>
  );
}
