import { NextResponse } from "next/server";
import { getStoreConfig } from "@/lib/blogger/config-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const { regions } = await getStoreConfig();
  return NextResponse.json({ regions });
}
