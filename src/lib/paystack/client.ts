/**
 * Paystack hosted checkout integration (server-only).
 *
 * Flow:
 *   1. Browser posts cart (product IDs + quantities + customer info) to
 *      /api/checkout.
 *   2. Server reloads authoritative Blogger products, verifies availability,
 *      recomputes totals, converts to Paystack minor units, and initializes
 *      a transaction with PAYSTACK_SECRET_KEY.
 *   3. Browser is redirected to the Paystack hosted checkout URL.
 *   4. Paystack redirects back to /checkout/verify?reference=...
 *   5. Server verifies the transaction via the Paystack API before showing
 *      success.
 *   6. Paystack webhook (HMAC-SHA512 validated) records the sale for the
 *      admin dashboard.
 *
 * PAYSTACK_SECRET_KEY is mandatory for checkout and verification. Missing
 * credentials produce a safe configuration error; payment is never emulated.
 */

import "server-only";
import * as crypto from "crypto";
import { toMinorUnits, fromMinorUnits } from "@/lib/ghana";

export interface PaystackLineItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number; // major units
  currency: "GHS" | "USD";
}

export interface PaystackInitInput {
  lines: PaystackLineItem[];
  email: string;
  deliveryFee: number;
  currency: "GHS" | "USD";
  deliveryName: string;
  deliveryPhone: string;
  deliveryRegion: string;
  deliveryAddress: string;
  notes?: string;
}

export interface PaystackInitResult {
  authorizationUrl: string;
  reference: string;
  accessCode: string;
}

export interface PaystackVerifyResult {
  status: "success" | "failed" | "pending";
  reference: string;
  amount: number; // minor units
  currency: "GHS" | "USD";
  channel: string;
  customerEmail: string;
  paidAt: string;
  fees: number;
}

function hasPaystack(): boolean {
  return Boolean(process.env.PAYSTACK_SECRET_KEY);
}

function genReference(): string {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 8);
  return `LG-${t}-${r}`.toUpperCase();
}

/**
 * Initialize a Paystack transaction.
 */
export async function initializeTransaction(
  input: PaystackInitInput
): Promise<PaystackInitResult> {
  const reference = genReference();
  const itemsTotal = input.lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const grandTotal = itemsTotal + input.deliveryFee;
  const minor = toMinorUnits(grandTotal, input.currency);

  if (!hasPaystack()) throw new Error("Paystack checkout is not configured.");

  const baseUrl = process.env.APP_BASE_URL ?? "https://la-glitz.vercel.app";
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reference,
      amount: minor,
      currency: input.currency,
      email: input.email,
      callback_url: `${baseUrl}/checkout/verify?reference=${reference}`,
      metadata: {
        custom_fields: [
          { display_name: "Customer Name", variable_name: "customer_name", value: input.deliveryName },
          { display_name: "Phone", variable_name: "phone", value: input.deliveryPhone },
          { display_name: "Region", variable_name: "region", value: input.deliveryRegion },
          { display_name: "Address", variable_name: "address", value: input.deliveryAddress },
          { display_name: "Notes", variable_name: "notes", value: input.notes ?? "" },
        ],
        line_items: input.lines.map((l) => ({
          product_id: l.productId,
          name: l.name,
          quantity: l.quantity,
          unit_price: l.unitPrice,
        })),
      },
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Paystack init failed (${res.status}): ${text}`);
  }
  const json = await res.json();
  return {
    authorizationUrl: json.data.authorization_url,
    reference,
    accessCode: json.data.access_code,
  };
}

/**
 * Verify a transaction by reference. Never trust a browser redirect.
 */
export async function verifyTransaction(
  reference: string
): Promise<PaystackVerifyResult> {
  if (!hasPaystack()) throw new Error("Paystack verification is not configured.");

  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Paystack verify failed (${res.status})`);
  }
  const json = await res.json();
  const data = json.data;
  return {
    status: data.status === "success" ? "success" : data.status === "pending" ? "pending" : "failed",
    reference: data.reference,
    amount: data.amount,
    currency: data.currency ?? "GHS",
    channel: data.channel ?? "card",
    customerEmail: data.customer?.email ?? "",
    paidAt: data.paid_at ?? new Date().toISOString(),
    fees: data.fees ?? 0,
  };
}

/**
 * Validate the Paystack webhook HMAC-SHA512 signature.
 * Reads the raw body BEFORE JSON parsing.
 */
export function validateWebhookSignature(
  rawBody: string,
  signature: string | null
): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !signature) return false;
  const hash = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");
  return hash === signature;
}

export { fromMinorUnits, toMinorUnits, hasPaystack };
