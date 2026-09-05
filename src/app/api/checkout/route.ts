import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCatalog } from "@/lib/blogger/client";
import { initializeTransaction, type PaystackLineItem } from "@/lib/paystack/client";
import { getStoreConfig } from "@/lib/blogger/config-store";

export const dynamic = "force-dynamic";

const CheckoutSchema = z.object({
  email: z.string().email(),
  lines: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive().max(99),
        attributes: z.record(z.string(), z.string()).default({}),
      })
    )
    .min(1, "Your bag is empty"),
  delivery: z.object({
    name: z.string().min(2),
    phone: z.string().min(6),
    regionId: z.string(),
    address: z.string().min(5),
    notes: z.string().optional().default(""),
  }),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = CheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid checkout data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { email, lines, delivery } = parsed.data;

  // Reload authoritative catalog - never trust browser prices
  const { products } = await getCatalog();
  const byId = new Map(products.map((p) => [p.id, p]));

  const verifiedLines: PaystackLineItem[] = [];
  for (const line of lines) {
    const product = byId.get(line.productId);
    if (!product) {
      return NextResponse.json(
        { error: `Product ${line.productId} is no longer available` },
        { status: 400 }
      );
    }
    if (product.availability === "sold-out") {
      return NextResponse.json(
        { error: `${product.name} is sold out` },
        { status: 400 }
      );
    }
    verifiedLines.push({
      productId: product.id,
      name: product.name,
      quantity: line.quantity,
      unitPrice: product.price,
      currency: product.currency,
    });
  }

  // resolve delivery region & fee
  const { regions } = await getStoreConfig();
  const region = regions.find((r) => r.id === delivery.regionId);
  if (!region) {
    return NextResponse.json({ error: "Invalid delivery region" }, { status: 400 });
  }

  const itemsTotal = verifiedLines.reduce(
    (s, l) => s + l.unitPrice * l.quantity,
    0
  );
  const currency = verifiedLines[0].currency;
  const deliveryFee = region.fee;

  try {
    const init = await initializeTransaction({
      lines: verifiedLines,
      email,
      deliveryFee,
      currency,
      deliveryName: delivery.name,
      deliveryPhone: delivery.phone,
      deliveryRegion: region.name,
      deliveryAddress: delivery.address,
      notes: delivery.notes,
    });

    return NextResponse.json({
      reference: init.reference,
      authorizationUrl: init.authorizationUrl,
      demo: init.demo,
      summary: {
        itemsTotal,
        deliveryFee,
        grandTotal: itemsTotal + deliveryFee,
        currency,
        region: region.name,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Checkout failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
