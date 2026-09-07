import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin-session";
import { listOrders, getSalesStats } from "@/lib/blogger/admin-store";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/sales — list orders and sales stats.
 *
 * Query params:
 *   - limit: number (default 200)
 *   - status: filter by status (pending | paid | failed | cancelled | refunded)
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const limit = sp.get("limit") ? Math.min(500, Math.max(1, Number(sp.get("limit")))) : 200;
  const status = sp.get("status") ?? undefined;

  const [orders, stats] = await Promise.all([
    listOrders({ limit, status }),
    getSalesStats(),
  ]);
  return NextResponse.json({ orders, stats });
}
