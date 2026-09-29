import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin-session";
import { db } from "@/lib/db";
import { formatGHS, fromMinorUnits } from "@/lib/ghana";
import { sendPaidOrderEmail } from "@/lib/emailjs-server";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const delivery = await db.emailDelivery.findUnique({
    where: { id },
    include: {
      order: { include: { items: true } },
    },
  });

  if (!delivery || delivery.kind !== "paid-order" || !delivery.order) {
    return NextResponse.json({ error: "Paid order email record not found" }, { status: 404 });
  }
  if (delivery.order.status !== "paid") {
    return NextResponse.json({ error: "Only paid orders can be resent" }, { status: 409 });
  }

  const order = delivery.order;
  const items = order.items
    .map((item) => `${item.name} x ${item.quantity} — ${formatGHS(item.unitPrice, order.currency as "GHS" | "USD")}`)
    .join("\n");

  try {
    const sent = await sendPaidOrderEmail({
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
    });

    if (!sent) {
      return NextResponse.json(
        { error: "EmailJS is not configured" },
        { status: 503 }
      );
    }
    return NextResponse.json({ ok: true, message: "Order email sent" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "EmailJS resend failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
