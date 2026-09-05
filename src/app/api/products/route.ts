import { NextRequest, NextResponse } from "next/server";
import { queryCatalog } from "@/lib/blogger/client";
import type { Availability, Badge, Category, CatalogQuery } from "@/lib/blogger/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const query: CatalogQuery = {
    search: sp.get("q") ?? sp.get("search") ?? undefined,
    category: (sp.get("category") as Category | "all") ?? "all",
    collection: sp.get("collection") ?? undefined,
    material: sp.get("material") ?? undefined,
    availability: (sp.get("availability") as Availability | "all") ?? "all",
    badges: sp.getAll("badge") as Badge[],
    minPrice: sp.get("minPrice") ? Number(sp.get("minPrice")) : undefined,
    maxPrice: sp.get("maxPrice") ? Number(sp.get("maxPrice")) : undefined,
    sort: (sp.get("sort") as CatalogQuery["sort"]) ?? "newest",
    page: sp.get("page") ? Number(sp.get("page")) : 1,
    pageSize: sp.get("pageSize") ? Number(sp.get("pageSize")) : 12,
  };
  const attrs: Record<string, string[]> = {};
  for (const [k, v] of sp.entries()) {
    if (k.startsWith("attr_")) {
      const name = k.slice(5);
      if (!attrs[name]) attrs[name] = [];
      attrs[name].push(v);
    }
  }
  if (Object.keys(attrs).length) query.attributes = attrs;

  try {
    const result = await queryCatalog(query);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to load catalog" }, { status: 500 });
  }
}
