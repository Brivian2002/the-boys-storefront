/**
 * Public catalog service.
 *
 * Reads from the DB Product cache (which is refreshed from Blogger by the
 * admin layer / refreshCatalog). When the cache is empty AND Blogger is
 * configured, a fresh pull is attempted. When Blogger is NOT configured,
 * the storefront simply renders an empty catalog state — no mock products.
 *
 * The DB cache is the source of truth for the storefront so a Blogger
 * outage never takes the shop down. The admin layer owns keeping the cache
 * in sync (refresh button + post-mutation re-pull).
 */

import "server-only";
import { db } from "@/lib/db";
import { bloggerConfigured, fetchPosts } from "./api";
import { postToProduct } from "./serializer";
import { MOCK_PRODUCTS } from "./mock-catalog";
import type {
  CatalogQuery,
  CatalogResult,
  Category,
  Product,
  ProductFacet,
} from "./types";

const REFRESH_TTL_MS = 5 * 60_000; // 5 minutes between auto-refreshes
let lastAutoRefresh = 0;

function hasBloggerCredentials(): boolean {
  return bloggerConfigured();
}

/**
 * Pull every product post from Blogger and upsert into the DB cache.
 * Called by refreshCatalog (admin button) and lazily by getCatalog when
 * the cache looks stale. Returns the count of products upserted.
 */
export async function syncFromBlogger(): Promise<number> {
  if (!hasBloggerCredentials()) return 0;

  const { posts } = await fetchPosts({ maxResults: 500, fetchBodies: true });
  const products: Product[] = [];
  for (const post of posts) {
    const p = postToProduct(post);
    if (p) products.push(p);
  }

  await db.$transaction(async (tx) => {
    // Replace cache: delete existing, insert fresh.
    await tx.productAttribute.deleteMany({});
    await tx.productImage.deleteMany({});
    await tx.product.deleteMany({});

    for (const p of products) {
      const created = await tx.product.create({
        data: {
          id: p.id,
          slug: p.slug,
          name: p.name,
          description: p.description,
          descriptionHtml: p.descriptionHtml ?? "",
          price: p.price,
          originalPrice: p.originalPrice ?? null,
          currency: p.currency,
          category: p.category,
          collection: p.collection ?? null,
          materials: JSON.stringify(p.materials),
          availability: p.availability,
          badges: JSON.stringify(p.badges),
          status: p.status,
          publishedAt: p.publishedAt ? new Date(p.publishedAt) : null,
        },
      });

      if (p.images.length) {
        await tx.productImage.createMany({
          data: p.images.map((img, i) => ({
            url: img.url,
            alt: img.alt ?? null,
            position: img.position ?? i,
            productId: created.id,
          })),
        });
      }
      if (p.attributes.length) {
        await tx.productAttribute.createMany({
          data: p.attributes.map((a) => ({
            name: a.name,
            values: JSON.stringify(a.values),
            productId: created.id,
          })),
        });
      }
    }
  });

  lastAutoRefresh = Date.now();
  return products.length;
}

/**
 * Read the DB cache. Lazily refresh from Blogger if the cache is empty
 * and Blogger is configured, or if the auto-refresh TTL has elapsed.
 */
export async function getCatalog(): Promise<{
  products: Product[];
  source: "blogger" | "db" | "empty";
  fresh: boolean;
}> {
  const products = await readFromDb();

  if (hasBloggerCredentials() && Date.now() - lastAutoRefresh > REFRESH_TTL_MS) {
    // background-ish refresh — await it so the first render after TTL is fresh
    try {
      await syncFromBlogger();
      lastAutoRefresh = Date.now();
      const refreshed = await readFromDb();
      return {
        products: refreshed,
        source: refreshed.length ? "blogger" : "empty",
        fresh: true,
      };
    } catch {
      // Blogger error — serve stale cache
      return {
        products,
        source: products.length ? "db" : "empty",
        fresh: false,
      };
    }
  }

  return {
    products,
    source: products.length ? (hasBloggerCredentials() ? "blogger" : "db") : "empty",
    fresh: true,
  };
}

async function readFromDb(): Promise<Product[]> {
  try {
    const rows = await db.product.findMany({
      include: { images: true, attributes: true },
      orderBy: { publishedAt: "desc" },
    });
    return rows.map(rowToProduct);
  } catch (error) {
    // A fresh deployment may not have its external database provisioned yet.
    // Keep public pages renderable; the admin/configuration page can surface
    // the missing database configuration for follow-up.
    console.warn("Catalog database unavailable; rendering an empty catalog", error);
    return [];
  }
}

function rowToProduct(
  row: Awaited<ReturnType<typeof db.product.findFirst>> & {}
): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    descriptionHtml: row.descriptionHtml || undefined,
    price: row.price,
    originalPrice: row.originalPrice ?? undefined,
    currency: row.currency as Product["currency"],
    category: row.category as Category,
    collection: row.collection ?? undefined,
    material: (JSON.parse(row.materials) as string[])[0] ?? "",
    materials: JSON.parse(row.materials) as string[],
    availability: row.availability as Product["availability"],
    badges: JSON.parse(row.badges) as Product["badges"],
    images: (row.images ?? [])
      .sort((a, b) => a.position - b.position)
      .map((i) => ({ url: i.url, alt: i.alt ?? undefined, position: i.position })),
    attributes: (row.attributes ?? []).map((a) => ({
      name: a.name,
      values: JSON.parse(a.values) as string[],
    })),
    publishedAt: row.publishedAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    status: row.status as Product["status"],
  };
}

/**
 * Force a refresh (admin button). Always pulls from Blogger.
 */
export async function refreshCatalog(): Promise<{ count: number; source: string }> {
  if (!hasBloggerCredentials()) {
    return { count: 0, source: "empty" };
  }
  const count = await syncFromBlogger();
  return { count, source: "blogger" };
}

/**
 * Query the catalog with filtering, sorting, and pagination.
 * Builds dynamic facets from real product data only.
 */
export async function queryCatalog(query: CatalogQuery = {}): Promise<CatalogResult> {
  const { products } = await getCatalog();

  let filtered = products.slice();

  if (query.category && query.category !== "all") {
    if (query.category === "new-arrivals") {
      filtered = filtered.filter((p) => p.badges.includes("new-arrival"));
    } else {
      filtered = filtered.filter((p) => p.category === query.category);
    }
  }

  if (query.search && query.search.trim()) {
    const q = query.search.trim().toLowerCase();
    filtered = filtered.filter((p) => {
      const haystack = [
        p.name,
        p.description,
        p.material,
        p.category,
        p.collection ?? "",
        p.availability,
        ...p.materials,
        ...p.badges,
        ...p.attributes.flatMap((a) => [a.name, ...a.values]),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  if (query.collection) {
    filtered = filtered.filter(
      (p) => p.collection?.toLowerCase() === query.collection!.toLowerCase()
    );
  }

  if (query.material) {
    filtered = filtered.filter((p) =>
      p.materials.some((m) => m.toLowerCase() === query.material!.toLowerCase())
    );
  }

  if (query.availability && query.availability !== "all") {
    filtered = filtered.filter((p) => p.availability === query.availability);
  }

  if (query.badges && query.badges.length) {
    const wanted = new Set(query.badges);
    filtered = filtered.filter((p) => p.badges.some((b) => wanted.has(b)));
  }

  if (typeof query.minPrice === "number") {
    filtered = filtered.filter((p) => p.price >= query.minPrice!);
  }
  if (typeof query.maxPrice === "number") {
    filtered = filtered.filter((p) => p.price <= query.maxPrice!);
  }

  if (query.attributes) {
    for (const [name, values] of Object.entries(query.attributes)) {
      if (!values.length) continue;
      const wanted = new Set(values.map((v) => v.toLowerCase()));
      filtered = filtered.filter((p) =>
        p.attributes.some(
          (a) =>
            a.name.toLowerCase() === name.toLowerCase() &&
            a.values.some((v) => wanted.has(v.toLowerCase()))
        )
      );
    }
  }

  switch (query.sort) {
    case "price-asc":
      filtered.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      filtered.sort((a, b) => b.price - a.price);
      break;
    case "popular":
      filtered.sort((a, b) => {
        const score = (p: Product) =>
          p.badges.includes("bestseller") ? 2 : p.badges.includes("featured") ? 1 : 0;
        return score(b) - score(a);
      });
      break;
    case "newest":
    default:
      filtered.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
  }

  const total = filtered.length;
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(60, Math.max(1, query.pageSize ?? 12));
  const start = (page - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);
  const facets = buildFacets(filtered);

  return { products: paged, total, facets };
}

function buildFacets(products: Product[]): ProductFacet[] {
  const facets: ProductFacet[] = [];

  const catCounts = new Map<string, number>();
  for (const p of products) catCounts.set(p.category, (catCounts.get(p.category) ?? 0) + 1);
  facets.push({
    field: "category",
    label: "Category",
    values: Array.from(catCounts.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count),
  });

  const matCounts = new Map<string, number>();
  for (const p of products) {
    for (const m of p.materials) matCounts.set(m, (matCounts.get(m) ?? 0) + 1);
  }
  facets.push({
    field: "material",
    label: "Material",
    values: Array.from(matCounts.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count),
  });

  const availCounts = new Map<string, number>();
  for (const p of products) availCounts.set(p.availability, (availCounts.get(p.availability) ?? 0) + 1);
  facets.push({
    field: "availability",
    label: "Availability",
    values: Array.from(availCounts.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count),
  });

  const colCounts = new Map<string, number>();
  for (const p of products) {
    if (p.collection) colCounts.set(p.collection, (colCounts.get(p.collection) ?? 0) + 1);
  }
  if (colCounts.size) {
    facets.push({
      field: "collection",
      label: "Collection",
      values: Array.from(colCounts.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count),
    });
  }

  const attrMap = new Map<string, Map<string, number>>();
  for (const p of products) {
    for (const a of p.attributes) {
      const inner = attrMap.get(a.name) ?? new Map<string, number>();
      for (const v of a.values) inner.set(v, (inner.get(v) ?? 0) + 1);
      attrMap.set(a.name, inner);
    }
  }
  for (const [name, inner] of attrMap) {
    facets.push({
      field: `attr:${name}`,
      label: name,
      values: Array.from(inner.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count),
    });
  }

  return facets;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { products } = await getCatalog();
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const { products } = await getCatalog();
  const others = products.filter((p) => p.id !== product.id);
  const scored = others.map((p) => {
    let score = 0;
    if (p.category === product.category) score += 3;
    if (p.collection && p.collection === product.collection) score += 2;
    const sharedMaterials = p.materials.filter((m) => product.materials.includes(m)).length;
    score += sharedMaterials;
    return { p, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.p);
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  const { products } = await getCatalog();
  return products
    .slice()
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const { products } = await getCatalog();
  const featured = products.filter((p) => p.badges.includes("featured"));
  return (featured.length ? featured : products).slice(0, limit);
}

export async function getActiveCategories(): Promise<{ category: Category; count: number }[]> {
  const { products } = await getCatalog();
  const counts = new Map<Category, number>();
  for (const p of products) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  return Array.from(counts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getCatalogStatus() {
  const { source, fresh, products } = await getCatalog();
  return {
    source,
    fresh,
    total: products.length,
    published: products.filter((p) => p.status === "published").length,
    draft: products.filter((p) => p.status === "draft").length,
    hidden: products.filter((p) => p.status === "hidden").length,
    lastFetched: lastAutoRefresh || Date.now(),
    bloggerConfigured: hasBloggerCredentials(),
  };
}

export { MOCK_PRODUCTS };
