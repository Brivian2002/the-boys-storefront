import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  Sparkles,
  Headset,
} from "lucide-react";
import { PublicShell } from "@/components/public/shell";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ClearCartOnSuccess } from "@/components/checkout/clear-cart-on-success";
import { normalizePaystackReference, verifyTransaction } from "@/lib/paystack/client";
import { SUPPORT_WHATSAPP_URL, fromMinorUnits, formatGHS } from "@/lib/ghana";
import { db } from "@/lib/db";
import { sendPaidOrderEmailOnce } from "@/lib/emailjs-server";

export const metadata: Metadata = {
  title: "Order confirmed · Afrocentric Jewelry by LaGlitz",
  description: "Your Afrocentric Jewelry by LaGlitz order status.",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}

export const dynamic = "force-dynamic";

export default async function VerifyPage({ searchParams }: PageProps) {
  const { reference: queryReference, trxref } = await searchParams;
  const rawReference = queryReference ?? trxref;
  if (!rawReference) notFound();
  const reference = normalizePaystackReference(rawReference);

  let status: "success" | "failed" | "pending" = "pending";
  let amount = 0;
  let currency: "GHS" | "USD" = "GHS";
  let customerEmail = "";
  let demo = false;
  let errorMsg: string | null = null;

  try {
    const order = await db.order.findUnique({
      where: { reference },
      include: { items: true },
    });
    if (!order) throw new Error("Order not found for that reference");

    const result = await verifyTransaction(reference);
    if (
      result.reference !== order.reference ||
      result.amount !== order.amountMinor ||
      result.currency !== order.currency
    ) {
      throw new Error("Payment verification did not match this order");
    }

    await db.order.update({
      where: { id: order.id },
      data: result.status
        ? {
            status: "paid",
            paidAt: result.paidAt ? new Date(result.paidAt) : new Date(),
            paystackChannel: result.channel ?? null,
          }
        : { status: "failed" },
    });

    if (result.status) {
      const items = order.items
        .map((item) => `${item.name} x ${item.quantity} — ${formatGHS(item.unitPrice, order.currency as "GHS" | "USD")}`)
        .join("\n");
      await sendPaidOrderEmailOnce(order.id, {
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
    }

    status = result.status ? "success" : "failed";
    amount = result.amount;
    currency = result.currency;
    customerEmail = result.customerEmail;
    demo = result.demo;
  } catch (e) {
    status = "failed";
    errorMsg = e instanceof Error ? e.message : "Verification failed";
  }

  return (
    <PublicShell>
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {status === "success" ? (
          <SuccessView
            reference={reference}
            amount={amount}
            currency={currency}
            customerEmail={customerEmail}
            demo={demo}
          />
        ) : status === "pending" ? (
          <PendingView reference={reference} />
        ) : (
          <FailedView reference={reference} error={errorMsg} />
        )}
      </div>
    </PublicShell>
  );
}

function SuccessView({
  reference,
  amount,
  currency,
  customerEmail,
  demo,
}: {
  reference: string;
  amount: number;
  currency: "GHS" | "USD";
  customerEmail: string;
  demo: boolean;
}) {
  const major = fromMinorUnits(amount);
  return (
    <>
      {/* Clear the cart on success */}
      <ClearCartOnSuccess />
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40">
          <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
          Order confirmed
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight">
          Thank you for your order.
        </h1>
        <p className="mt-3 text-muted-foreground max-w-md leading-relaxed">
          Your payment has been received and your piece is now being prepared
          at our Ashaley Botwe atelier. We&apos;ve emailed a confirmation{customerEmail ? " to" : ""}
          {customerEmail ? (
            <>
              {" "}
              <span className="font-medium text-foreground">{customerEmail}</span>
            </>
          ) : null}
 .
        </p>

        <div className="mt-8 w-full rounded-lg border border-border bg-card p-5 sm:p-6 text-left">
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Order reference</dt>
              <dd className="font-mono font-medium">{reference}</dd>
            </div>
            {amount > 0 && (
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Amount paid</dt>
                <dd className="font-medium">{formatGHS(major, currency)}</dd>
              </div>
            )}
            {demo && (
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Mode</dt>
                <dd className="font-medium text-amber-600 dark:text-amber-400">
                  Demo payment
                </dd>
              </div>
            )}
            <Separator />
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">What's next</dt>
              <dd className="font-medium">We'll be in touch shortly</dd>
            </div>
          </dl>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full justify-center">
          <Button asChild size="lg" className="text-base">
            <Link href="/shop">
              Continue shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-base">
            <a href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <Headset className="mr-2 h-4 w-4" />
              Contact the atelier
            </a>
          </Button>
        </div>

        <div className="mt-10 inline-flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
          Each piece is hand-finished in our Ashaley Botwe atelier.
        </div>
      </div>
    </>
  );
}

function PendingView({ reference }: { reference: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
      </div>
      <h1 className="font-serif text-3xl font-semibold tracking-tight">
        Verifying your payment...
      </h1>
      <p className="mt-3 text-muted-foreground max-w-md">
        We're confirming your transaction with Paystack. Please don't close this
        page. Reference: <span className="font-mono">{reference}</span>
      </p>
    </div>
  );
}

function FailedView({ reference, error }: { reference: string; error: string | null }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <XCircle className="h-10 w-10 text-destructive" />
      </div>
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
        Payment not completed
      </p>
      <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight">
        We couldn't confirm your payment.
      </h1>
      <p className="mt-3 text-muted-foreground max-w-md leading-relaxed">
        {error
          ? error
          : "Your payment may have been declined, cancelled, or is still pending. Your bag has been saved — you can try again."}
      </p>

      <div className="mt-8 w-full rounded-lg border border-border bg-card p-5 sm:p-6 text-left">
        <dl className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Order reference</dt>
            <dd className="font-mono font-medium">{reference}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full justify-center">
        <Button asChild size="lg" className="text-base">
          <Link href="/cart">Try again</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="text-base">
          <a href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            <Headset className="mr-2 h-4 w-4" />
            Contact the atelier
          </a>
        </Button>
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        If you believe this is an error and you've been charged, please contact
        us with your order reference.
      </p>
    </div>
  );
}
