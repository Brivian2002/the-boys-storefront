import type { Availability, CatalogFacets, CatalogProduct, CatalogResponse } from "@shared/catalog";

type BloggerPost = {
  id?: string;
  title?: string;
  content?: string;
  labels?: string[];
  published?: string;
  updated?: string;
};

type BloggerResponse = {
  items?: BloggerPost[];
};

type CacheEntry = {
  response: CatalogResponse;
  freshUntil: number;
  staleUntil: number;
};

const FRESH_FOR_MS = 90_000;
const STALE_FOR_MS = 15 * 60_000;
const REQUEST_TIMEOUT_MS = 6_000;
let cache: CacheEntry | undefined;

const DEFAULT_FACETS: CatalogFacets = {
  categories: [],
  collections: [],
  materials: [],
  availability: [],
};

export function emptyCatalog(): CatalogResponse {
  return { products: [], facets: DEFAULT_FACETS };
}

function normalizedLabel(label: string): string {
  return label.trim().toLowerCase().replace(/^#/, "").replace(/\s+/g, "-");
}

function labelValue(labels: string[], prefix: string): string | undefined {
  const value = labels.find(label => label.startsWith(prefix));
  return value ? value.slice(prefix.length).trim() : undefined;
}

function titleCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function stripHtml(html = ""): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function contentImages(html = ""): string[] {
  const matches = html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
  return Array.from(matches)
    .map(match => match[1])
    .filter((src): src is string => Boolean(src && /^https?:\/\//i.test(src)))
    .slice(0, 6);
}

function priceFromLabels(labels: string[]): number | undefined {
  const raw = labelValue(labels, "price-");
  if (!raw) return undefined;
  const price = Number(raw.replace(/[^0-9.]/g, ""));
  return Number.isFinite(price) && price >= 0 ? price : undefined;
}

function availabilityFromLabels(labels: string[]): Availability {
  const value = labelValue(labels, "availability-");
  if (value === "out-of-stock" || value === "preorder" || value === "hidden") return value;
  return "in-stock";
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "piece";
}

/**
 * A post must explicitly be marked product and carry a valid price. Category is
 * intentionally optional: unlabelled pieces remain discoverable under All jewelry.
 */
export function parseProduct(post: BloggerPost): CatalogProduct | undefined {
  const labels = (post.labels ?? []).map(normalizedLabel);
  const id = post.id?.trim();
  const name = post.title?.trim();
  const price = priceFromLabels(labels);

  if (!id || !name || !labels.includes("product") || price === undefined) return undefined;

  const category = titleCase(labelValue(labels, "category-") ?? "all-jewelry");
  const collection = titleCase(labelValue(labels, "collection-") ?? "signature");
  const materialValues = labels
    .filter(label => label.startsWith("material-"))
    .map(label => titleCase(label.slice("material-".length)))
    .filter(Boolean);
  const availability = availabilityFromLabels(labels);

  if (availability === "hidden") return undefined;

  const badges: CatalogProduct["badges"] = [];
  if (labels.includes("featured")) badges.push("Featured");
  if (labels.includes("new-arrival")) badges.push("New arrival");
  if (labels.includes("sale")) badges.push("Sale");

  return {
    id,
    slug: `${slugify(name)}-${slugify(id).slice(-10)}`,
    name,
    description: stripHtml(post.content) || "Details are being prepared for this piece.",
    price,
    currency: (labelValue(labels, "currency-") ?? "USD").toUpperCase().slice(0, 3),
    category,
    collection,
    materials: materialValues.length ? materialValues : ["Details available on request"],
    availability,
    images: contentImages(post.content),
    badges,
    publishedAt: post.published ?? post.updated ?? new Date(0).toISOString(),
  };
}

export function makeFacets(products: CatalogProduct[]): CatalogFacets {
  const unique = (values: string[]) => Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
  return {
    categories: unique(products.map(product => product.category)),
    collections: unique(products.map(product => product.collection)),
    materials: unique(products.flatMap(product => product.materials)),
    availability: unique(products.map(product => product.availability)) as Availability[],
  };
}

function configuredFeed(): { blogId: string; apiKey: string } | undefined {
  const blogId = process.env.BLOGGER_BLOG_ID?.trim();
  const apiKey = process.env.BLOGGER_API_KEY?.trim();
  return blogId && apiKey ? { blogId, apiKey } : undefined;
}

async function fetchPosts(): Promise<BloggerPost[]> {
  const config = configuredFeed();
  if (!config) return [];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const endpoint = new URL(`https://www.googleapis.com/blogger/v3/blogs/${encodeURIComponent(config.blogId)}/posts`);
  endpoint.searchParams.set("key", config.apiKey);
  endpoint.searchParams.set("maxResults", "500");
  endpoint.searchParams.set("fetchImages", "true");

  try {
    const response = await fetch(endpoint, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`Blogger feed returned ${response.status}`);
    const payload = (await response.json()) as BloggerResponse;
    return Array.isArray(payload.items) ? payload.items : [];
  } finally {
    clearTimeout(timeout);
  }
}

export async function getCatalog(): Promise<CatalogResponse> {
  const now = Date.now();
  if (cache && now < cache.freshUntil) return cache.response;

  try {
    const posts = await fetchPosts();
    const products = posts
      .map(parseProduct)
      .filter((product): product is CatalogProduct => Boolean(product))
      .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
    const response = { products, facets: makeFacets(products) };
    cache = { response, freshUntil: now + FRESH_FOR_MS, staleUntil: now + STALE_FOR_MS };
    return response;
  } catch (error) {
    console.error("[Catalog] Product feed temporarily unavailable", error instanceof Error ? error.message : "unknown error");
    if (cache && now < cache.staleUntil) return cache.response;
    return emptyCatalog();
  }
}

export function __resetCatalogCache() {
  cache = undefined;
}
