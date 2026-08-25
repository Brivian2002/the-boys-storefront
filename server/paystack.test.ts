import { describe, expect, it } from "vitest";
import { asMinorUnit, isValidPaystackSignature, pricePublishedCart } from "./paystack";

const products = [{ id: "ring-1", name: "Celeste Ring", price: 1250, currency: "NGN", availability: "in-stock" as const }];

describe("Paystack checkout safeguards", () => {
  it("recalculates the submitted cart total from the published catalog", () => {
    const price = pricePublishedCart([{ id: "ring-1", quantity: 2 }], products as never);
    expect(price.totalMinor).toBe(250000);
    expect(price.currency).toBe("NGN");
    expect(asMinorUnit(1250)).toBe(125000);
  });

  it("rejects missing or unavailable pieces instead of trusting the browser cart", () => {
    expect(() => pricePublishedCart([{ id: "missing", quantity: 1 }], products as never)).toThrow("no longer in the collection");
    expect(() => pricePublishedCart([{ id: "ring-1", quantity: 1 }], [{ ...products[0], availability: "out-of-stock" }] as never)).toThrow("not currently available");
  });

  it("does not validate webhook events without a configured secret and signature", () => {
    expect(isValidPaystackSignature(Buffer.from("{}"), undefined)).toBe(false);
  });
});
