import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin-session";
import { listSales, getSalesStats } from "@/lib/blogger/admin-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [sales, stats] = await Promise.all([listSales(), getSalesStats()]);
  return NextResponse.json({ sales, stats });
}
