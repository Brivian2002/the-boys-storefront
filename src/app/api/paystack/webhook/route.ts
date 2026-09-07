import { NextRequest, NextResponse } from "next/server";
import { validateWebhookSignature } from "@/lib/paystack/client";
import { db } from "@/lib/db";

/**
 * POST /api/paystack/webhook
 *
 * Validates the HMAC-SHA512 signature in the x-paystack-signature header
 * against the raw request body, then updates the matching Order row in the DB.
 */
export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-paystack-signature");
  const rawBody = await req.text();

  if (!validateWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event: string; data: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Only process successful charge events
  if (event.event === "charge.success") {
    const data = event.data;
    const reference = String(data.reference ?? "");
    const channel = String(data.channel ?? "card");
    const paidAt = String(data.paid_at ?? new Date().toISOString());

    if (reference) {
      await db.order
        .updateMany({
          where: { reference, status: { not: "paid" } },
          data: {
            status: "paid",
            paidAt: new Date(paidAt),
            paystackChannel: channel,
          },
        })
        .catch(() => undefined);
    }
  }

  // Always 200 so Paystack doesn't retry
  return NextResponse.json({ status: "ok" });
}
