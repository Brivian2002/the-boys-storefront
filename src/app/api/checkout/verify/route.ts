import { NextRequest, NextResponse } from "next/server";
import { normalizePaystackReference, verifyTransaction } from "@/lib/paystack/client";
import { db } from "@/lib/db";
import { formatGHS, fromMinorUnits } from "@/lib/ghana";
import { sendPaidOrderEmailOnce } from "@/lib/emailjs-server";

export const dynamic = "force-dynamic";

/**
 * GET /api/checkout/verify?reference=...
 *
 * Server-side verification of a Paystack transaction by reference.
 * Updates the matching Order row in the DB.
 */
export async function GET(req: NextRequest) {
  const rawReference =
    req.nextUrl.searchParams.get("reference") ??
    req.nextUrl.searchParams.get("trxref");
  if (!rawReference) {
    return NextResponse.json(
      { error: "Missing transaction reference" },
      { status: 400 }
    );
  }
  const reference = normalizePaystackReference(rawReference);

  // Find the order in DB
  const order = await db.order.findUnique({
    where: { reference },
    include: { items: true },
  });
  if (!order) {
    return NextResponse.json(
      { error: "Order not found for that reference" },
      { status: 404 }
    );
  }

  try {
    const result = await verifyTransaction(reference);

    if (
      result.reference !== order.reference ||
      result.amount !== order.amountMinor ||
      result.currency !== order.currency
    ) {
      await db.order
        .update({ where: { id: order.id }, data: { status: "failed" } })
        .catch(() => undefined);
      return NextResponse.json(
        { error: "Payment verification did not match this order", status: "failed" },
        { status: 400 }
      );
    }

    if (result.status) {
      await db.order.update({
        where: { id: order.id },
        data: {
          status: "paid",
          paidAt: result.paidAt ? new Date(result.paidAt) : new Date(),
          paystackChannel: result.channel ?? null,
        },
      });
      const items = order.items
        .map((item) => `${item.name} x ${item.quantity} — ${formatGHS(item.unitPrice, order.currency as "GHS" | "USD")}`)
        .join("\n");
      await sendPaidOrderEmailOnce(order.id, {
        orderId: order.id,
        reference: order.reference,
        customerEmail: order.customerEmail,
        customerName: order.deliveryName,
        phone: order.deliveryPhone,
        amount: fromMinorUnits(order.amountMinor),
        currency: order.currency,
        items,
        deliveryRegion: order.deliveryRegion,
        deliveryAddress: order.deliveryAddress,
        notes: order.notes ?? "",
      }).catch((emailError) => {
        console.error("Paid order verified but seller email failed", emailError);
      });
    } else {
      await db.order.update({
        where: { id: order.id },
        data: { status: "failed" },
      });
    }

    return NextResponse.json({
      status: result.status ? "success" : "failed",
      reference: result.reference,
      amount: result.amount,
      currency: result.currency,
      customerEmail: result.customerEmail,
      paidAt: result.paidAt,
      gatewayResponse: result.gatewayResponse,
    });
  } catch (e) {
    // Paystack not configured or network error
    const msg = e instanceof Error ? e.message : "Verification failed";
    return NextResponse.json(
      { error: msg, status: "failed" },
      { status: 500 }
    );
  }
}
