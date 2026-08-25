import { afterEach, describe, expect, it, vi } from "vitest";
import { __resetCatalogCache, getCatalog, makeFacets, parseProduct } from "./catalog";

describe("Blogger product classification", () => {
  afterEach(() => {
    __resetCatalogCache();
    vi.unstubAllGlobals();
    delete process.env.BLOGGER_BLOG_ID;
    delete process.env.BLOGGER_API_KEY;
  });

  it("only qualifies explicit product posts with a valid price", () => {
    expect(parseProduct({ id: "1", title: "Journal note", labels: ["product"] })).toBeUndefined();
    expect(parseProduct({ id: "2", title: "Unmarked ring", labels: ["price-120"] })).toBeUndefined();
  });

  it("normalizes structured labels and applies clear fallbacks", () => {
    const product = parseProduct({
      id: "12345",
      title: "Celeste Ring",
      content: '<p>A sculptural silhouette.</p><img src="https://images.example/ring.jpg">',
      labels: ["#product", "#price-1200", "#category-rings", "#collection-evening", "#material-18k-gold", "#new-arrival"],
      published: "2026-08-20T10:00:00.000Z",
    });

    expect(product).toMatchObject({
      name: "Celeste Ring",
      price: 1200,
      category: "Rings",
      collection: "Evening",
      availability: "in-stock",
      materials: ["18k Gold"],
      badges: ["New arrival"],
    });
    expect(product?.images).toEqual(["https://images.example/ring.jpg"]);
    expect(makeFacets(product ? [product] : [])).toEqual({
      categories: ["Rings"],
      collections: ["Evening"],
      materials: ["18k Gold"],
      availability: ["in-stock"],
    });
  });

  it("keeps the catalog empty when feed configuration is absent", async () => {
    await expect(getCatalog()).resolves.toEqual({
      products: [],
      facets: { categories: [], collections: [], materials: [], availability: [] },
    });
  });

  it("uses the short-lived server cache rather than repeat feed requests", async () => {
    process.env.BLOGGER_BLOG_ID = "blog-123";
    process.env.BLOGGER_API_KEY = "server-only-key";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await getCatalog();
    await getCatalog();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("www.googleapis.com/blogger/v3/blogs/blog-123/posts");
  });
});
