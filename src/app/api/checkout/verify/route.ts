import { NextRequest, NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/paystack/client";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/checkout/verify?reference=...
 *
 * Server-side verification of a Paystack transaction by reference.
 * Updates the matching Order row in the DB.
 */
export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");
  if (!reference) {
    return NextResponse.json(
      { error: "Missing transaction reference" },
      { status: 400 }
    );
  }

  // Find the order in DB
  const order = await db.order.findUnique({ where: { reference } });
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
