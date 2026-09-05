import { NextRequest, NextResponse } from "next/server";
import { validateWebhookSignature } from "@/lib/paystack/client";
import { recordSale } from "@/lib/blogger/admin-store";

/**
 * Paystack webhook.
 *
 * CRITICAL: reads the raw request body BEFORE JSON parsing to validate the
 * HMAC-SHA512 signature in the x-paystack-signature header. Only valid
 * successful payment events are accepted.
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
    await recordSale({
      reference: String(data.reference ?? ""),
      amount: Number(data.amount ?? 0),
      currency: (data.currency as "GHS" | "USD") ?? "GHS",
      channel: String(data.channel ?? "card"),
      customerEmail: String((data.customer as { email?: string })?.email ?? ""),
      paidAt: String(data.paid_at ?? new Date().toISOString()),
      demo: false,
    });
  }

  // Always 200 so Paystack doesn't retry
  return NextResponse.json({ status: "ok" });
}
