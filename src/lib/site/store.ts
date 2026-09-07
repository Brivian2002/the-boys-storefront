/**
 * DB-backed site settings with a short in-memory cache.
 *
 * Settings are stored as a single JSON document in the SiteSetting table
 * under the key `site.settings`. A 10-second memory cache prevents the
 * header/footer (which render on every public page) from hitting the
 * database on every request.
 */

import "server-only";
import { db } from "@/lib/db";
import { DEFAULT_SETTINGS } from "./defaults";
import type { SiteSettings } from "./types";

const SETTING_KEY = "site.settings";
const CACHE_TTL_MS = 10_000; // 10 seconds

let cached: { value: SiteSettings; fetchedAt: number } | null = null;

/**
 * Read the merged site settings. Falls back to DEFAULT_SETTINGS if the
 * database row is missing or partially corrupt. Never throws — the public
 * storefront must always render.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const now = Date.now();
  if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.value;
  }

  let value: SiteSettings;
  try {
    const row = await db.siteSetting.findUnique({ where: { key: SETTING_KEY } });
    if (row?.value) {
      value = mergeWithDefaults(JSON.parse(row.value));
      value.updatedAt = row.updatedAt.toISOString();
    } else {
      value = { ...DEFAULT_SETTINGS, updatedAt: new Date().toISOString() };
    }
  } catch {
    // database not yet migrated or transient error — use defaults
    value = { ...DEFAULT_SETTINGS, updatedAt: new Date().toISOString() };
  }

  cached = { value, fetchedAt: now };
  return value;
}

/**
 * Persist the full settings document. Used by the admin Store settings tab.
 */
export async function saveSiteSettings(
  next: Partial<SiteSettings>
): Promise<SiteSettings> {
  const current = await getSiteSettings();
  const sanitized = sanitizeSettings({ ...current, ...next });
  sanitized.updatedAt = new Date().toISOString();

  await db.siteSetting.upsert({
    where: { key: SETTING_KEY },
    update: { value: JSON.stringify(sanitized) },
    create: { key: SETTING_KEY, value: JSON.stringify(sanitized) },
  });

  cached = { value: sanitized, fetchedAt: Date.now() };
  return sanitized;
}

/**
 * Strip dangerous fields and clamp the region list so the public storefront
 * never renders broken data. Numbers are coerced; strings are trimmed.
 */
export function sanitizeSettings(input: Partial<SiteSettings>): SiteSettings {
  const base: SiteSettings = {
    ...DEFAULT_SETTINGS,
    ...input,
    brand: { ...DEFAULT_SETTINGS.brand, ...(input.brand ?? {}) },
    contact: { ...DEFAULT_SETTINGS.contact, ...(input.contact ?? {}) },
    social: { ...DEFAULT_SETTINGS.social, ...(input.social ?? {}) },
    maps: { ...DEFAULT_SETTINGS.maps, ...(input.maps ?? {}) },
    delivery: { ...DEFAULT_SETTINGS.delivery, ...(input.delivery ?? {}) },
    regions:
      Array.isArray(input.regions) && input.regions.length
        ? input.regions.map((r) => ({
            id: String(r.id || ""),
            name: String(r.name || r.id || ""),
            fee: Number.isFinite(r.fee) ? Math.max(0, r.fee) : 0,
            etaDays: [
              Math.max(0, Math.floor(r.etaDays?.[0] ?? 1)),
              Math.max(0, Math.floor(r.etaDays?.[1] ?? 3)),
            ] as [number, number],
            pickupAvailable: Boolean(r.pickupAvailable),
            notes: r.notes ? String(r.notes) : undefined,
          }))
        : DEFAULT_SETTINGS.regions,
  };

  // trim strings
  base.announcement = (base.announcement ?? "").toString().slice(0, 280);
  base.brand.name = (base.brand.name ?? "").toString().trim().slice(0, 120);
  base.brand.tagline = (base.brand.tagline ?? "").toString().trim().slice(0, 80);
  base.brand.founderName = (base.brand.founderName ?? "")
    .toString()
    .trim()
    .slice(0, 120);
  base.contact.email = (base.contact.email ?? "").toString().trim().slice(0, 160);
  base.contact.phone = (base.contact.phone ?? "").toString().trim().slice(0, 40);
  base.contact.whatsapp = (base.contact.whatsapp ?? "")
    .toString()
    .trim()
    .slice(0, 40);
  base.contact.address = (base.contact.address ?? "")
    .toString()
    .trim()
    .slice(0, 200);
  base.contact.hours = (base.contact.hours ?? "").toString().trim().slice(0, 120);

  return base;
}

function mergeWithDefaults(partial: Partial<SiteSettings>): SiteSettings {
  return sanitizeSettings({ ...DEFAULT_SETTINGS, ...partial });
}

export { DEFAULT_SETTINGS };
