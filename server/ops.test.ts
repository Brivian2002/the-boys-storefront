import { afterEach, describe, expect, it } from "vitest";
import { createDashboardSession, hasDashboardSession, OPS_COOKIE, verifyDashboardPassword } from "./opsAuth";
import { buildBloggerProductPayload } from "./bloggerAdmin";

afterEach(() => {
  delete process.env.ADMIN_DASHBOARD_PASSWORD;
  delete process.env.JWT_SECRET;
});

describe("private operations access", () => {
  it("accepts only the server-side password and validates a signed, expiring session", async () => {
    process.env.ADMIN_DASHBOARD_PASSWORD = "Github";
    process.env.JWT_SECRET = "test-session-signing-key";
    expect(verifyDashboardPassword("Github")).toBe(true);
    expect(verifyDashboardPassword("github")).toBe(false);
    const token = await createDashboardSession();
    const request = { headers: { cookie: `${OPS_COOKIE}=${encodeURIComponent(token)}` } } as never;
    expect(await hasDashboardSession(request)).toBe(true);
  });

  it("rejects missing or invalid session cookies", async () => {
    process.env.JWT_SECRET = "test-session-signing-key";
    expect(await hasDashboardSession({ headers: {} } as never)).toBe(false);
    expect(await hasDashboardSession({ headers: { cookie: `${OPS_COOKIE}=invalid` } } as never)).toBe(false);
  });
});

describe("Blogger product operations", () => {
  it("turns dashboard fields into the product, price, discovery, and availability labels used by the storefront", () => {
    const post = buildBloggerProductPayload({ title: "Solstice Pendant", description: "Quiet shine.", price: 30000, currency: "ngn", category: "Fine Necklaces", collection: "Solstice", materials: ["18k Gold", "Freshwater Pearl"], attributes: [{ name: "Gemstone", values: ["Freshwater Pearl"] }, { name: "Ring size", values: ["7", "8"] }], availability: "in-stock", featured: true, newArrival: true, sale: false, imageUrls: ["https://images.example.com/pendant.jpg"], publishNow: true });
    expect(post.labels).toEqual(expect.arrayContaining(["product", "price-30000", "currency-ngn", "category-fine-necklaces", "collection-solstice", "material-18k-gold", "material-freshwater-pearl", "attribute-gemstone--freshwater-pearl", "attribute-ring-size--7", "attribute-ring-size--8", "availability-in-stock", "featured", "new-arrival"]));
    expect(post.content).toContain('src="https://images.example.com/pendant.jpg"');
  });
});
