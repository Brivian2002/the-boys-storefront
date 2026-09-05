import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin-session";
import { getStoreConfig, saveStoreConfig, type StoreConfig } from "@/lib/blogger/config-store";
import { GHANA_REGIONS, STORE_CONTACT } from "@/lib/ghana";

export const dynamic = "force-dynamic";

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  return NextResponse.json(await getStoreConfig());
}

export async function PUT(request: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  try {
    const input = (await request.json()) as StoreConfig;
    if (!Array.isArray(input.regions) || input.regions.length === 0 || !input.contact) return NextResponse.json({ error: "Invalid delivery configuration" }, { status: 400 });
    const regions = input.regions.map((region) => ({ ...region, fee: Number(region.fee), etaDays: [Number(region.etaDays[0]), Number(region.etaDays[1])] as [number, number] })).filter((region) => region.id && region.name && Number.isFinite(region.fee) && region.fee >= 0 && region.etaDays[0] >= 0 && region.etaDays[1] >= region.etaDays[0]);
    if (regions.length !== input.regions.length) return NextResponse.json({ error: "Each region needs a valid name, fee, and ETA range" }, { status: 400 });
    const saved = await saveStoreConfig({ regions, contact: { ...STORE_CONTACT, ...input.contact } });
    return NextResponse.json(saved);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save delivery settings" }, { status: 500 });
  }
}
