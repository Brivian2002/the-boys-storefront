import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin-session";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/blogger/seed — seed the catalog with starter demo products.
 *
 * This is a convenience endpoint for development. In production, the owner
 * adds products via the Blogger blog (or the admin product composer).
 */
export async function POST() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    // The mock catalog ships with 12 demo products. If the catalog is empty
    // (first run), seed it by re-importing the mock catalog state.
    const { seedMockCatalog } = await import("@/lib/blogger/catalog-state");
    await seedMockCatalog?.();
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Seed failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
