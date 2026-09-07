import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCatalog } from "@/lib/blogger/client";
import { initializeTransaction } from "@/lib/paystack/client";
import { getSiteSettings } from "@/lib/site/store";
import { toMinorUnits, type DeliveryRegion } from "@/lib/ghana";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

const CheckoutSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
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

function makeReference(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `LGL-${ts}-${rand}`;
}

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

  const { email, phone, lines, delivery } = parsed.data;

  // Reload authoritative catalog - never trust browser prices
  const { products } = await getCatalog();
  const byId = new Map(products.map((p) => [p.id, p]));

  type VerifiedLine = {
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    currency: "GHS" | "USD";
  };
  const verifiedLines: VerifiedLine[] = [];
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

  // Resolve region & fee from site settings (DB)
  const settings = await getSiteSettings();
  const region = settings.regions.find(
    (r: DeliveryRegion) => r.id === delivery.regionId
  );
  if (!region) {
    return NextResponse.json({ error: "Invalid delivery region" }, { status: 400 });
  }

  const currency = verifiedLines[0].currency;
  const itemsTotal = verifiedLines.reduce(
    (s, l) => s + l.unitPrice * l.quantity,
    0
  );
  const deliveryFee = region.fee;
  const grandTotal = itemsTotal + deliveryFee;
  const amountMinor = toMinorUnits(grandTotal, currency);

  // Persist order in DB
  const reference = makeReference();
  let orderId: string;
  try {
    const order = await db.order.create({
      data: {
        reference,
        status: "pending",
        amountMinor,
        currency,
        customerEmail: email,
        deliveryName: delivery.name,
        deliveryPhone: delivery.phone,
        deliveryRegion: region.name,
        deliveryAddress: delivery.address,
        notes: delivery.notes || null,
        items: {
          create: verifiedLines.map((l) => ({
            productId: l.productId,
            name: l.name,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
          })),
        },
      },
    });
    orderId = order.id;
  } catch (e) {
    console.error("Failed to create order", e);
    return NextResponse.json(
      { error: "Could not create order" },
      { status: 500 }
    );
  }

  // Initialize Paystack transaction
  let authorizationUrl: string;
  let paystackReference: string;
  try {
    const appBaseUrl = env().APP_BASE_URL || "http://localhost:3000";
    const callbackUrl = `${appBaseUrl}/checkout/verify?reference=${encodeURIComponent(reference)}`;
    const init = await initializeTransaction({
      email,
      amountMinor,
      currency,
      reference,
      callbackUrl,
      metadata: {
        orderId,
        customer: {
          email,
          phone: phone ?? delivery.phone,
          name: delivery.name,
        },
        delivery: {
          name: delivery.name,
          phone: delivery.phone,
          region: region.name,
          address: delivery.address,
          notes: delivery.notes || "",
        },
        items: verifiedLines.map((l) => ({
          name: l.name,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
        })),
        deliveryFee,
        custom_fields: [
          { display_name: "Order ID", variable_name: "order_id", value: orderId },
          { display_name: "Region", variable_name: "region", value: region.name },
        ],
      },
    });
    authorizationUrl = init.authorizationUrl;
    paystackReference = init.reference;
  } catch (e) {
    // Mark order as failed so it's visible in admin
    await db.order
      .update({
        where: { id: orderId },
        data: { status: "failed" },
      })
      .catch(() => undefined);
    const msg = e instanceof Error ? e.message : "Checkout failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  if (paystackReference !== reference) {
    // Keep our reference as the canonical one — Paystack echoes back what we sent
    // but be defensive.
    void paystackReference;
  }

  return NextResponse.json({
    reference,
    authorizationUrl,
    summary: {
      itemsTotal,
      deliveryFee,
      grandTotal,
      currency,
      region: region.name,
    },
  });
}
