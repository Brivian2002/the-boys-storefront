import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin-session";
import { db } from "@/lib/db";
import { CATEGORY_DESCRIPTIONS, type Category } from "@/lib/blogger/types";

export const dynamic = "force-dynamic";

const CategoriesSchema = z.object({
  key: z.string().min(1).max(60),
  description: z.string().min(1).max(2000),
});

/**
 * PUT /api/admin/categories — upsert a category's description in the DB.
 *
 * Stored as a SiteSetting row keyed `category:description:{key}`.
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
  const parsed = CategoriesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const key = `category:description:${parsed.data.key}`;
  await db.siteSetting.upsert({
    where: { key },
    create: { key, value: parsed.data.description },
    update: { value: parsed.data.description },
  });
  return NextResponse.json({ ok: true });
}

/**
 * GET /api/admin/categories — return all saved category descriptions.
 */
export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db.siteSetting.findMany({
    where: { key: { startsWith: "category:description:" } },
  });
  const descriptions: Record<string, string> = { ...CATEGORY_DESCRIPTIONS };
  for (const r of rows) {
    const key = r.key.replace("category:description:", "") as Category;
    descriptions[key] = r.value;
  }
  return NextResponse.json({ descriptions });
}
