import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import { getCatalog } from "./catalog";

export type CheckoutLineInput = { id: string; quantity: number };
export type CheckoutContact = {
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
};

type PricedLine = CheckoutLineInput & {
  name: string;
  unitPrice: number;
  currency: string;
};

type PaystackInitializeResponse = {
  status: boolean;
  message: string;
  data?: { authorization_url?: string; access_code?: string; reference?: string };
};

type PaystackVerifyResponse = {
  status: boolean;
  message: string;
  data?: {
    status?: string;
    reference?: string;
    amount?: number;
    currency?: string;
    paid_at?: string;
    channel?: string;
    customer?: { email?: string };
    metadata?: { cartTotalMinor?: number; lineItems?: unknown[] } | string | null;
  };
};

const PAYSTACK_API = "https://api.paystack.co";

function requirePaystackSecret(): string {
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!secret) throw new Error("Paystack checkout is not configured yet.");
  return secret;
}

export function asMinorUnit(amount: number): number {
  return Math.round(amount * 100);
}

export function pricePublishedCart(lines: CheckoutLineInput[], products: Awaited<ReturnType<typeof getCatalog>>["products"]): { lines: PricedLine[]; currency: string; totalMinor: number } {
  const byId = new Map(products.map(product => [product.id, product]));
  const pricedLines = lines.map(line => {
    const product = byId.get(line.id);
    if (!product) throw new Error("A selected piece is no longer in the collection.");
    if (product.availability !== "in-stock") throw new Error(`${product.name} is not currently available.`);
    return { id: product.id, quantity: line.quantity, name: product.name, unitPrice: product.price, currency: product.currency };
  });
  if (!pricedLines.length) throw new Error("Your bag is empty.");
  const currency = pricedLines[0].currency;
  if (pricedLines.some(line => line.currency !== currency)) throw new Error("Your selected pieces must use one currency for checkout.");
  return { lines: pricedLines, currency, totalMinor: asMinorUnit(pricedLines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)) };
}

export async function initializePaystackCheckout(input: { lines: CheckoutLineInput[]; contact: CheckoutContact; callbackUrl: string }) {
  const { products } = await getCatalog();
  const order = pricePublishedCart(input.lines, products);
  const secret = requirePaystackSecret();
  const reference = `laglitz-${crypto.randomUUID()}`;
  const payload = {
    email: input.contact.email,
    amount: String(order.totalMinor),
    currency: order.currency,
    reference,
    callback_url: input.callbackUrl,
    metadata: JSON.stringify({
      source: "la-glitz-storefront",
      cartTotalMinor: order.totalMinor,
      lineItems: order.lines.map(line => ({ id: line.id, name: line.name, quantity: line.quantity, unitPrice: line.unitPrice })),
      delivery: input.contact,
    }),
  };
  const response = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await response.json()) as PaystackInitializeResponse;
  if (!response.ok || !data.status || !data.data?.authorization_url || !data.data.reference) throw new Error(data.message || "Paystack could not start checkout.");
  return { authorizationUrl: data.data.authorization_url, reference: data.data.reference };
}

export async function verifyPaystackTransaction(reference: string) {
  const secret = requirePaystackSecret();
  const response = await fetch(`${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  const payload = (await response.json()) as PaystackVerifyResponse;
  if (!response.ok || !payload.status || !payload.data) throw new Error(payload.message || "We could not verify this payment.");
  const metadata = typeof payload.data.metadata === "string" ? JSON.parse(payload.data.metadata || "{}") : (payload.data.metadata ?? {});
  const amountMatches = typeof metadata.cartTotalMinor === "number" && metadata.cartTotalMinor === payload.data.amount;
  return {
    reference: payload.data.reference ?? reference,
    status: payload.data.status === "success" && amountMatches ? "success" as const : "pending" as const,
    paidAt: payload.data.paid_at ?? null,
    amount: payload.data.amount ?? 0,
    currency: payload.data.currency ?? "",
    email: payload.data.customer?.email ?? "",
    channel: payload.data.channel ?? "",
  };
}

export function isValidPaystackSignature(rawBody: Buffer, signature: string | undefined): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!secret || !signature) return false;
  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
  const received = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  return received.length === expectedBuffer.length && timingSafeEqual(received, expectedBuffer);
}

/** Paystack dashboard is the payment source of record; this endpoint securely acknowledges signed live events. */
export async function handlePaystackWebhook(req: Request, res: Response) {
  const body = req.body;
  if (!Buffer.isBuffer(body) || !isValidPaystackSignature(body, req.header("x-paystack-signature"))) return res.status(401).json({ received: false });
  try {
    const event = JSON.parse(body.toString("utf8")) as { event?: string; data?: { reference?: string; amount?: number; currency?: string } };
    if (event.event === "charge.success") console.info("[Paystack] Verified successful payment", { reference: event.data?.reference, amount: event.data?.amount, currency: event.data?.currency });
    return res.status(200).json({ received: true });
  } catch {
    return res.status(400).json({ received: false });
  }
}
