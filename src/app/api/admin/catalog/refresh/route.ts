import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin-session";
import { refreshCatalog, getCatalogStatus } from "@/lib/blogger/client";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await refreshCatalog();
  const status = await getCatalogStatus();
  return NextResponse.json({ ok: true, status });
}
