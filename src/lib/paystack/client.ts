/**
 * Paystack API client.
 *
 * REAL implementation — no demo fallback. Throws when PAYSTACK_SECRET_KEY
 * is missing so misconfiguration surfaces immediately rather than silently
 * charging nothing.
 */

import "server-only";
import * as crypto from "crypto";
import { env } from "@/lib/env";

const BASE = "https://api.paystack.co";

export interface InitializeTxInput {
  email: string;
  amountMinor: number;
  currency?: "GHS" | "USD";
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
  channels?: string[];
}

export interface InitializeTxResult {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export interface VerifyTxResult {
  status: boolean;
  reference: string;
  amount: number; // minor units
  currency: string;
  channel: string | null;
  customerEmail: string;
  paidAt: string | null;
  gatewayResponse: string;
  fees: number;
}

function getKey(): string {
  const key = env().PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error(
      "PAYSTACK_SECRET_KEY is not configured. Add it to .env to enable live payments."
    );
  }
  return key;
}

export async function initializeTransaction(
  input: InitializeTxInput
): Promise<InitializeTxResult> {
  const res = await fetch(`${BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amountMinor,
      currency: input.currency ?? "GHS",
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
      channels: input.channels,
    }),
  });
  const json = (await res.json()) as {
    status: boolean;
    message: string;
    data?: { authorization_url: string; access_code: string; reference: string };
  };
  if (!res.ok || !json.status || !json.data) {
    throw new Error(
      `Paystack initialize failed: ${res.status} ${json.message ?? res.statusText}`
    );
  }
  return {
    authorizationUrl: json.data.authorization_url,
    accessCode: json.data.access_code,
    reference: json.data.reference,
  };
}

export async function verifyTransaction(
  reference: string
): Promise<VerifyTxResult> {
  const res = await fetch(
    `${BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${getKey()}` },
    }
  );
  const json = (await res.json()) as {
    status: boolean;
    message: string;
    data?: {
      status: string;
      reference: string;
      amount: number;
      currency: string;
      channel: string | null;
      customer?: { email: string };
      paid_at: string | null;
      gateway_response: string;
      fees: number;
    };
  };
  if (!res.ok || !json.status || !json.data) {
    throw new Error(
      `Paystack verify failed: ${res.status} ${json.message ?? res.statusText}`
    );
  }
  const d = json.data;
  return {
    status: d.status === "success",
    reference: d.reference,
    amount: d.amount,
    currency: d.currency,
    channel: d.channel,
    customerEmail: d.customer?.email ?? "",
    paidAt: d.paid_at,
    gatewayResponse: d.gateway_response,
    fees: d.fees ?? 0,
  };
}

/**
 * Validate a Paystack webhook event using the x-paystack-signature header.
 * The signature is an HMAC-SHA512 of the raw request body keyed by the
 * secret key.
 */
export function validateWebhookSignature(
  rawBody: string,
  signature: string | null
): boolean {
  if (!signature) return false;
  const key = env().PAYSTACK_SECRET_KEY;
  if (!key) return false;
  const expected = crypto
    .createHmac("sha512", key)
    .update(rawBody)
    .digest("hex");
  if (expected.length !== signature.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
