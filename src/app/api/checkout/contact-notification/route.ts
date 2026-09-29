import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const Schema = z.object({ reference: z.string().min(1).max(120) });

export async function POST(req: NextRequest) {
  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid reference" }, { status: 400 });

  const order = await db.order.findUnique({ where: { reference: parsed.data.reference } });
  if (!order || order.status !== "paid") {
    return NextResponse.json({ error: "Only paid orders can be recorded" }, { status: 409 });
  }

  await db.emailDelivery.create({
    data: {
      orderId: order.id,
      kind: "paid-order-contact",
      recipient: "laglitz@gmail.com",
      subject: `[CUSTOMER ORDER] New Order — ${order.reference}`,
      status: "sent",
      provider: "emailjs-browser-contact-path",
    },
  });

  return NextResponse.json({ ok: true });
}
