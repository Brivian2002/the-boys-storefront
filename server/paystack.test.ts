import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { handlePaystackWebhook, initializePaystackCheckout, isValidPaystackSignature, listPaystackSales, pricePublishedCart } from "./paystack";
import type { CatalogProduct } from "../shared/catalog";

const product: CatalogProduct = {
  id: "ring-1", slug: "solstice-ring-ring-1", name: "Solstice Ring", description: "A ring.", price: 25000, currency: "NGN", category: "Rings", collection: "Solstice", materials: ["18k Gold"], availability: "in-stock", images: [], badges: [], publishedAt: "2026-08-28T00:00:00Z",
};

afterEach(() => {
  delete process.env.PAYSTACK_SECRET_KEY;
  vi.unstubAllGlobals();
});

describe("Paystack checkout", () => {
  it("recalculates the checkout amount from the current Blogger product rather than browser prices", () => {
    expect(pricePublishedCart([{ id: "ring-1", quantity: 2 }], [product])).toMatchObject({ currency: "NGN", total: 50000 });
    expect(() => pricePublishedCart([{ id: "missing", quantity: 1 }], [product])).toThrow("no longer available");
  });

  it("initializes a hosted transaction with the server-only secret and amount in subunits", async () => {
    process.env.PAYSTACK_SECRET_KEY = "sk_test_example";
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ status: true, data: { authorization_url: "https://checkout.paystack.com/test", reference: "laglitz-test" } }) });
    vi.stubGlobal("fetch", fetchMock);
    const result = await initializePaystackCheckout({ lines: [{ id: "ring-1", quantity: 1 }], contact: { email: "buyer@example.com", name: "A Buyer", phone: "08000000000", address: "1 Gold Street", city: "Accra" }, callbackUrl: "https://shop.example.com/checkout/verify" }, [product]);
    expect(result.authorizationUrl).toContain("checkout.paystack.com");
    const init = fetchMock.mock.calls[0];
    expect(String(init?.[0])).toContain("/transaction/initialize");
    expect(init?.[1]?.headers.Authorization).toBe("Bearer sk_test_example");
    expect(JSON.parse(init?.[1]?.body).amount).toBe("2500000");
  });

  it("accepts only a constant-time matching webhook signature", () => {
    process.env.PAYSTACK_SECRET_KEY = "sk_test_example";
    const body = Buffer.from('{"event":"charge.success"}');
    const signature = createHmac("sha512", "sk_test_example").update(body).digest("hex");
    expect(isValidPaystackSignature(body, signature)).toBe(true);
    expect(isValidPaystackSignature(body, "not-a-signature")).toBe(false);
  });

  it("maps successful Paystack sales without exposing the secret", async () => {
    process.env.PAYSTACK_SECRET_KEY = "sk_test_example";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ status: true, data: [{ reference: "sale-1", amount: 2500000, currency: "NGN", paid_at: "2026-08-28T00:00:00Z", customer: { email: "buyer@example.com" }, channel: "card" }] }) }));
    await expect(listPaystackSales()).resolves.toEqual([{ reference: "sale-1", amount: 2500000, currency: "NGN", paidAt: "2026-08-28T00:00:00Z", customerEmail: "buyer@example.com", channel: "card" }]);
  });

  it("acknowledges only a valid signed Paystack charge webhook", async () => {
    process.env.PAYSTACK_SECRET_KEY = "sk_test_example";
    const body = Buffer.from('{"event":"charge.success","data":{"reference":"sale-1"}}');
    const signature = createHmac("sha512", "sk_test_example").update(body).digest("hex");
    const response = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    await handlePaystackWebhook({ body, header: () => signature } as never, response as never);
    expect(response.status).toHaveBeenCalledWith(200);
    await handlePaystackWebhook({ body, header: () => "invalid" } as never, response as never);
    expect(response.status).toHaveBeenCalledWith(401);
  });
});
