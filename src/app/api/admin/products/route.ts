import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin-session";
import {
  listAllProducts,
  createProduct,
} from "@/lib/blogger/admin-store";
import type { Availability, Badge, Category, Currency } from "@/lib/blogger/types";

export const dynamic = "force-dynamic";

const VALID_CATEGORIES: Category[] = [
  "rings",
  "earrings",
  "necklaces",
  "bracelets",
  "watches",
  "brooches",
  "sets",
  "new-arrivals",
];
const VALID_AVAIL: Availability[] = ["in-stock", "sold-out", "pre-order", "limited"];
const VALID_BADGES: Badge[] = ["featured", "new-arrival", "sale", "bestseller", "exclusive"];
const VALID_CURRENCIES: Currency[] = ["GHS", "USD"];

const ProductDraftSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().min(5).max(5000),
  descriptionHtml: z.string().max(20000).optional(),
  price: z.number().nonnegative(),
  originalPrice: z.number().nonnegative().optional(),
  currency: z.enum(VALID_CURRENCIES as [Currency, ...Currency[]]),
  category: z.enum(VALID_CATEGORIES as [Category, ...Category[]]),
  collection: z.string().max(80).optional(),
  materials: z.array(z.string()).default([]),
  availability: z.enum(VALID_AVAIL as [Availability, ...Availability[]]),
  badges: z.array(z.enum(VALID_BADGES as [Badge, ...Badge[]])).default([]),
  images: z
    .array(
      z.object({
        url: z.string().url().or(z.string().startsWith("/")),
        alt: z.string().optional(),
      })
    )
    .default([]),
  attributes: z
    .array(
      z.object({
        name: z.string().min(1).max(60),
        values: z.array(z.string()).default([]),
      })
    )
    .default([]),
  status: z.enum(["published", "draft", "hidden"]).default("published"),
});

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const products = await listAllProducts();
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
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
  const parsed = ProductDraftSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid product", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const product = await createProduct(parsed.data);
  return NextResponse.json({ product }, { status: 201 });
}
