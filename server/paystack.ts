import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import type { CatalogProduct } from "../shared/catalog";

const PAYSTACK_API = "https://api.paystack.co";

export type CheckoutLine = { id: string; quantity: number };
export type CheckoutContact = { email: string; name: string; phone: string; address: string; city: string };
export type CheckoutInput = { lines: CheckoutLine[]; contact: CheckoutContact; callbackUrl: string };

type PaystackTransaction = { status?: string; reference?: string; amount?: number; currency?: string; paid_at?: string; customer?: { email?: string }; channel?: string };

export type PaystackSale = { reference: string; amount: number; currency: string; paidAt: string | null; customerEmail: string | null; channel: string | null };

function requirePaystackSecret(): string {
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!secret) throw new Error("Secure payment is not configured yet. Please try again later.");
  return secret;
}

export function pricePublishedCart(lines: CheckoutLine[], products: CatalogProduct[]) {
  const productsById = new Map(products.map(product => [product.id, product]));
  const selected = lines.map(line => ({ ...line, product: productsById.get(line.id) }));
  if (selected.some(line => !line.product)) throw new Error("One or more selected pieces are no longer available.");
  if (selected.some(line => line.product?.availability !== "in-stock")) throw new Error("One or more selected pieces are not ready to purchase.");
  const currency = selected[0]?.product?.currency;
  if (!currency || selected.some(line => line.product?.currency !== currency)) throw new Error("Please purchase pieces in the same currency separately.");
  const total = selected.reduce((sum, line) => sum + (line.product?.price ?? 0) * line.quantity, 0);
  if (!Number.isFinite(total) || total <= 0) throw new Error("The selected total cannot be processed.");
  return { currency, total, lines: selected.map(line => ({ id: line.id, quantity: line.quantity, name: line.product?.name })) };
}

export async function initializePaystackCheckout(input: CheckoutInput, products: CatalogProduct[]) {
  const order = pricePublishedCart(input.lines, products);
  const response = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
    method: "POST",
    headers: { Authorization: `Bearer ${requirePaystackSecret()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: input.contact.email,
      amount: String(Math.round(order.total * 100)),
      currency: order.currency,
      reference: `laglitz-${crypto.randomUUID()}`,
      callback_url: input.callbackUrl,
      metadata: JSON.stringify({ customer: input.contact, lines: order.lines }),
    }),
  });
  const payload = await response.json() as { status?: boolean; message?: string; data?: { authorization_url?: string; reference?: string } };
  if (!response.ok || !payload.status || !payload.data?.authorization_url || !payload.data.reference) throw new Error(payload.message || "Paystack could not begin checkout.");
  return { authorizationUrl: payload.data.authorization_url, reference: payload.data.reference };
}

export async function verifyPaystackTransaction(reference: string) {
  const response = await fetch(`${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`, { headers: { Authorization: `Bearer ${requirePaystackSecret()}` } });
  const payload = await response.json() as { status?: boolean; message?: string; data?: PaystackTransaction };
  if (!response.ok || !payload.status || !payload.data) throw new Error(payload.message || "Payment confirmation is temporarily unavailable.");
  return { success: payload.data.status === "success", reference: payload.data.reference ?? reference, amount: payload.data.amount ?? 0, currency: payload.data.currency ?? "", paidAt: payload.data.paid_at ?? null };
}

export async function listPaystackSales(): Promise<PaystackSale[]> {
  const response = await fetch(`${PAYSTACK_API}/transaction?status=success&perPage=50`, { headers: { Authorization: `Bearer ${requirePaystackSecret()}` } });
  const payload = await response.json() as { status?: boolean; message?: string; data?: PaystackTransaction[] };
  if (!response.ok || !payload.status || !Array.isArray(payload.data)) throw new Error(payload.message || "Sales records are temporarily unavailable.");
  return payload.data.map(transaction => ({ reference: transaction.reference ?? "Unknown", amount: transaction.amount ?? 0, currency: transaction.currency ?? "", paidAt: transaction.paid_at ?? null, customerEmail: transaction.customer?.email ?? null, channel: transaction.channel ?? null }));
}

export function isValidPaystackSignature(rawBody: Buffer, signature?: string): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!secret || !signature) return false;
  const expected = Buffer.from(createHmac("sha512", secret).update(rawBody).digest("hex"), "utf8");
  const actual = Buffer.from(signature, "utf8");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function handlePaystackWebhook(req: Request, res: Response) {
  const rawBody = req.body;
  if (!Buffer.isBuffer(rawBody) || !isValidPaystackSignature(rawBody, req.header("x-paystack-signature") ?? undefined)) return res.status(401).json({ received: false });
  try {
    const event = JSON.parse(rawBody.toString("utf8")) as { event?: string; data?: { reference?: string } };
    if (event.event === "charge.success") console.info("[Payments] Paystack charge confirmed", { reference: event.data?.reference });
    return res.status(200).json({ received: true });
  } catch {
    return res.status(400).json({ received: false });
  }
}
