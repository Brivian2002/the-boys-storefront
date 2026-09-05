import { NextRequest, NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/paystack/client";
import { recordSale } from "@/lib/blogger/admin-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");
  if (!reference) {
    return NextResponse.json(
      { error: "Missing transaction reference" },
      { status: 400 }
    );
  }
  try {
    const result = await verifyTransaction(reference);
    // record the sale for the admin dashboard
    if (result.status === "success") {
      await recordSale({
        reference: result.reference,
        amount: result.amount,
        currency: result.currency,
        channel: result.channel,
        customerEmail: result.customerEmail,
        paidAt: result.paidAt,
        demo: result.demo,
      });
    }
    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Verification failed";
    return NextResponse.json({ error: msg, status: "failed" }, { status: 500 });
  }
}
