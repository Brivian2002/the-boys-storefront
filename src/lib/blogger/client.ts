import "server-only";
import { parseLabels, titleToSlug } from "./parser";
import type { CatalogQuery, CatalogResult, Category, Product, ProductFacet } from "./types";

const BLOGGER_API = "https://www.googleapis.com/blogger/v3";
const OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const CACHE_TTL_MS = 60_000;
const CACHE_STALE_MS = 10 * 60_000;

export type BloggerPost = {
  id: string;
  title: string;
  content?: string;
  labels?: string[];
  published?: string;
  updated?: string;
};

type CacheEntry = { products: Product[]; fetchedAt: number };
let cache: CacheEntry | null = null;
let refreshPromise: Promise<Product[]> | null = null;

export function hasBloggerCredentials() {
  return Boolean(
    process.env.BLOGGER_BLOG_ID?.trim() &&
      (process.env.BLOGGER_API_KEY?.trim() ||
        (process.env.GOOGLE_BLOGGER_CLIENT_ID?.trim() &&
          process.env.GOOGLE_BLOGGER_CLIENT_SECRET?.trim() &&
          process.env.GOOGLE_BLOGGER_REFRESH_TOKEN?.trim()))
  );
}

async function getAccessToken() {
  const clientId = process.env.GOOGLE_BLOGGER_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_BLOGGER_CLIENT_SECRET?.trim();
  const refreshToken = process.env.GOOGLE_BLOGGER_REFRESH_TOKEN?.trim();
  if (!clientId || !clientSecret || !refreshToken) return null;
  const response = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: "refresh_token" }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Blogger OAuth token request failed: ${response.status}`);
  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("Blogger OAuth token response did not include an access token");
  return data.access_token;
}

async function fetchBloggerPosts(): Promise<BloggerPost[]> {
  const blogId = process.env.BLOGGER_BLOG_ID?.trim();
  if (!blogId) return [];
  const token = await getAccessToken();
  const params = new URLSearchParams({ fetchBodies: "true", maxResults: "500" });
  if (!token && process.env.BLOGGER_API_KEY?.trim()) params.set("key", process.env.BLOGGER_API_KEY.trim());
  const response = await fetch(`${BLOGGER_API}/blogs/${encodeURIComponent(blogId)}/posts?${params}`, {
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Blogger catalog request failed: ${response.status}`);
  const data = (await response.json()) as { items?: BloggerPost[] };
  return data.items ?? [];
}

function stripHtml(html: string) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function postToProduct(post: BloggerPost): Product | null {
  const labels = post.labels ?? [];
  const parsed = parseLabels(labels);
  if (!parsed.isProduct || parsed.isHidden || parsed.price === undefined || !parsed.category) return null;
  const content = post.content ?? "";
  const images = Array.from(content.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)).map((match) => ({ url: match[1], alt: post.title }));
  const publishedAt = post.published ?? post.updated ?? new Date(0).toISOString();
  const updatedAt = post.updated ?? publishedAt;
  return {
    id: post.id,
    slug: titleToSlug(post.title),
    name: post.title.trim(),
    description: stripHtml(content),
    descriptionHtml: content,
    price: parsed.price,
    currency: parsed.currency ?? "GHS",
    category: parsed.category,
    collection: parsed.collection,
    material: parsed.materials[0] ?? "",
    materials: parsed.materials,
    availability: parsed.availability ?? "in-stock",
    badges: parsed.badges,
    images,
    attributes: parsed.attributes,
    publishedAt,
    updatedAt,
    status: post.published ? "published" : "draft",
  };
}

async function fetchCatalogRaw() {
  if (!hasBloggerCredentials()) return [];
  const posts = await fetchBloggerPosts();
  return posts.map(postToProduct).filter((product): product is Product => Boolean(product));
}

export async function getCatalog(): Promise<{ products: Product[]; source: "blogger" | "empty"; fresh: boolean }> {
  if (!hasBloggerCredentials()) return { products: [], source: "empty", fresh: true };
  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) return { products: cache.products, source: "blogger", fresh: true };
  if (cache && now - cache.fetchedAt < CACHE_STALE_MS) {
    if (!refreshPromise) refreshPromise = fetchCatalogRaw().then((products) => { cache = { products, fetchedAt: Date.now() }; return products; }).finally(() => { refreshPromise = null; });
    return { products: cache.products, source: "blogger", fresh: false };
  }
  if (!refreshPromise) refreshPromise = fetchCatalogRaw().then((products) => { cache = { products, fetchedAt: Date.now() }; return products; }).finally(() => { refreshPromise = null; });
  try {
    return { products: await refreshPromise, source: "blogger", fresh: true };
  } catch (error) {
    if (cache) return { products: cache.products, source: "blogger", fresh: false };
    throw error;
  }
}

export async function refreshCatalog() { cache = null; refreshPromise = null; await getCatalog(); }

export async function queryCatalog(query: CatalogQuery = {}): Promise<CatalogResult> {
  const { products } = await getCatalog();
  let filtered = products.slice();
  if (query.category && query.category !== "all") filtered = query.category === "new-arrivals" ? filtered.filter((p) => p.badges.includes("new-arrival")) : filtered.filter((p) => p.category === query.category);
  if (query.search?.trim()) {
    const q = query.search.trim().toLowerCase();
    filtered = filtered.filter((p) => [p.name, p.description, p.material, p.category, p.collection ?? "", p.availability, ...p.materials, ...p.badges, ...p.attributes.flatMap((a) => [a.name, ...a.values])].join(" ").toLowerCase().includes(q));
  }
  if (query.collection) filtered = filtered.filter((p) => p.collection?.toLowerCase() === query.collection!.toLowerCase());
  if (query.material) filtered = filtered.filter((p) => p.materials.some((m) => m.toLowerCase() === query.material!.toLowerCase()));
  if (query.availability && query.availability !== "all") filtered = filtered.filter((p) => p.availability === query.availability);
  if (query.badges?.length) filtered = filtered.filter((p) => p.badges.some((b) => query.badges!.includes(b)));
  if (typeof query.minPrice === "number") filtered = filtered.filter((p) => p.price >= query.minPrice!);
  if (typeof query.maxPrice === "number") filtered = filtered.filter((p) => p.price <= query.maxPrice!);
  if (query.attributes) for (const [name, values] of Object.entries(query.attributes)) if (values.length) filtered = filtered.filter((p) => p.attributes.some((a) => a.name.toLowerCase() === name.toLowerCase() && a.values.some((v) => values.map((value) => value.toLowerCase()).includes(v.toLowerCase()))));
  if (query.sort === "price-asc") filtered.sort((a, b) => a.price - b.price);
  else if (query.sort === "price-desc") filtered.sort((a, b) => b.price - a.price);
  else if (query.sort === "popular") filtered.sort((a, b) => Number(b.badges.includes("bestseller")) - Number(a.badges.includes("bestseller")));
  else filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  const total = filtered.length;
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(60, Math.max(1, query.pageSize ?? 12));
  return { products: filtered.slice((page - 1) * pageSize, page * pageSize), total, facets: buildFacets(filtered) };
}

function buildFacets(products: Product[]): ProductFacet[] {
  const make = (field: string, label: string, values: Iterable<string>) => { const counts = new Map<string, number>(); for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1); return { field, label, values: Array.from(counts, ([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count) }; };
  const facets: ProductFacet[] = [make("category", "Category", products.map((p) => p.category)), make("material", "Material", products.flatMap((p) => p.materials)), make("availability", "Availability", products.map((p) => p.availability))];
  const collections = products.map((p) => p.collection).filter((v): v is string => Boolean(v));
  if (collections.length) facets.push(make("collection", "Collection", collections));
  const attrs = new Map<string, string[]>();
  for (const product of products) for (const attribute of product.attributes) attrs.set(attribute.name, [...(attrs.get(attribute.name) ?? []), ...attribute.values]);
  for (const [name, values] of attrs) facets.push(make(`attr:${name}`, name, values));
  return facets;
}

export async function getProductBySlug(slug: string) { return (await getCatalog()).products.find((p) => p.slug === slug) ?? null; }
export async function getRelatedProducts(product: Product, limit = 4) { return (await getCatalog()).products.filter((p) => p.id !== product.id).map((p) => ({ p, score: (p.category === product.category ? 3 : 0) + (p.collection === product.collection ? 2 : 0) + p.materials.filter((m) => product.materials.includes(m)).length })).sort((a, b) => b.score - a.score).slice(0, limit).map(({ p }) => p); }
export async function getNewArrivals(limit = 8) { return (await getCatalog()).products.slice().sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()).slice(0, limit); }
export async function getFeaturedProducts(limit = 8) { return (await getCatalog()).products.filter((p) => p.badges.includes("featured")).slice(0, limit); }
export async function getActiveCategories() { const counts = new Map<Category, number>(); for (const p of (await getCatalog()).products) counts.set(p.category, (counts.get(p.category) ?? 0) + 1); return Array.from(counts, ([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count); }
export async function getCatalogStatus() { const { products, source, fresh } = await getCatalog(); return { source, fresh, total: products.length, published: products.filter((p) => p.status === "published").length, draft: products.filter((p) => p.status === "draft").length, hidden: 0, lastFetched: cache?.fetchedAt ?? Date.now(), bloggerConfigured: hasBloggerCredentials() }; }
