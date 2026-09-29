import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin-session";
import { getSiteSettings, saveSiteSettings } from "@/lib/site/store";
import type { SiteSettings } from "@/lib/site/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/settings — return the full site settings (admin view).
 */
export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const settings = await getSiteSettings();
  return NextResponse.json({ settings });
}

const SettingsSchema = z.object({
  announcement: z.string().max(280).optional(),
  legalBusinessName: z.string().max(160).optional(),
  brand: z
    .object({
      name: z.string().max(120).optional(),
      tagline: z.string().max(120).optional(),
      description: z.string().max(500).optional(),
      founderName: z.string().max(120).optional(),
    })
    .optional(),
  contact: z
    .object({
      email: z.string().max(120).optional(),
      phone: z.string().max(40).optional(),
      whatsapp: z.string().max(40).optional(),
      address: z.string().max(280).optional(),
      hours: z.string().max(120).optional(),
    })
    .optional(),
  social: z
    .object({
      instagram: z.string().url().optional().or(z.literal("").optional()),
      facebook: z.string().url().optional().or(z.literal("").optional()),
      tiktok: z.string().url().optional().or(z.literal("").optional()),
      whatsapp: z.string().url().optional().or(z.literal("").optional()),
    })
    .optional(),
  maps: z
    .object({
      query: z.string().max(200).optional(),
    })
    .optional(),
  delivery: z
    .object({
      headline: z.string().max(200).optional(),
      worldwide: z.string().max(1000).optional(),
      paymentOnDelivery: z.string().max(1000).optional(),
      pickup: z.string().max(1000).optional(),
    })
    .optional(),
  regions: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        fee: z.number().nonnegative(),
        etaDays: z.tuple([z.number().int(), z.number().int()]),
        pickupAvailable: z.boolean(),
        notes: z.string().optional(),
      })
    )
    .optional(),
});

/**
 * PUT /api/admin/settings — update site settings (partial).
 */
export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const parsed = SettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid settings", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const current = await getSiteSettings();
  const next: SiteSettings = {
    ...current,
    ...parsed.data,
    brand: { ...current.brand, ...(parsed.data.brand ?? {}) },
    contact: { ...current.contact, ...(parsed.data.contact ?? {}) },
    social: { ...current.social, ...(parsed.data.social ?? {}) },
    maps: { ...current.maps, ...(parsed.data.maps ?? {}) },
    delivery: { ...current.delivery, ...(parsed.data.delivery ?? {}) },
    regions: parsed.data.regions ?? current.regions,
    updatedAt: new Date().toISOString(),
  };
  const saved = await saveSiteSettings(next);
  return NextResponse.json(saved);
}
