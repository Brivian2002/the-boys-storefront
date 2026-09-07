import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/site/store";

export const dynamic = "force-dynamic";

/**
 * GET /api/settings — public site settings.
 *
 * Returns the subset of settings needed by the public storefront:
 * brand, contact, social, maps, delivery copy, regions, and the announcement
 * bar text. Secrets are never exposed.
 */
export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json({
    brand: settings.brand,
    contact: settings.contact,
    social: settings.social,
    maps: settings.maps,
    delivery: settings.delivery,
    regions: settings.regions,
    announcement: settings.announcement,
  });
}
