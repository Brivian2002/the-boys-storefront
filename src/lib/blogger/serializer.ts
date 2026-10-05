/**
 * Serializer between Product (domain) and Blogger post (transport).
 *
 * The product payload is embedded as a JSON document inside an HTML comment
 * at the top of the post body. This keeps the richly-typed product data
 * (images, attributes, descriptionHtml, originalPrice) intact across
 * round-trips without relying on label parsing for those fields. The labels
 * remain the source of truth for filterable facets (price, category,
 * material, availability, badges, attributes) so the Blogger admin UI and
 * search still work.
 */

import type { BloggerPost } from "./api";
import { parseLabels, serializeProductToLabels, titleToSlug } from "./parser";
import type { Product, ProductImage } from "./types";

const PAYLOAD_MARKER = "BOYS_STORE_PRODUCT_PAYLOAD";

interface ProductPayload {
  v: 1;
  id: string;
  slug: string;
  name: string;
  description: string;
  descriptionHtml: string;
  price: number;
  originalPrice?: number;
  currency: "GHS" | "USD";
  category: Product["category"];
  collection?: string;
  material: string;
  materials: string[];
  availability: Product["availability"];
  badges: Product["badges"];
  images: ProductImage[];
  attributes: Product["attributes"];
  status: Product["status"];
  publishedAt?: string;
  updatedAt?: string;
}

/**
 * Convert a Product to a Blogger post body + labels + title.
 */
export function productToPost(product: Product): {
  title: string;
  content: string;
  labels: string[];
} {
  const payload: ProductPayload = {
    v: 1,
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    descriptionHtml: product.descriptionHtml ?? "",
    price: product.price,
    originalPrice: product.originalPrice,
    currency: product.currency,
    category: product.category,
    collection: product.collection,
    material: product.material,
    materials: product.materials,
    availability: product.availability,
    badges: product.badges,
    images: product.images,
    attributes: product.attributes,
    status: product.status,
    publishedAt: product.publishedAt,
    updatedAt: product.updatedAt,
  };

  const json = JSON.stringify(payload);
  const visibleHtml =
    product.descriptionHtml?.trim() ||
    `<p>${escapeHtml(product.description)}</p>`;

  const content = `<!--${PAYLOAD_MARKER}:${json}-->\n${visibleHtml}`;

  const labels = serializeProductToLabels({
    price: product.price,
    currency: product.currency,
    category: product.category,
    collection: product.collection,
    materials: product.materials,
    availability: product.availability,
    badges: product.badges,
    attributes: product.attributes,
    hidden: product.status !== "published",
  });

  return { title: product.name, content, labels };
}

/**
 * Convert a Blogger post to a Product. Returns null when the post is not a
 * valid product (missing `product` label, missing payload, or no price).
 */
export function postToProduct(post: BloggerPost): Product | null {
  const labels = post.labels ?? [];
  const parsed = parseLabels(labels);

  if (!parsed.isProduct) return null;
  if (typeof parsed.price !== "number") return null;

  const payload = extractPayload(post.content);
  const status: Product["status"] = parsed.isHidden
    ? "hidden"
    : post.status === "DRAFT"
      ? "draft"
      : "published";

  const slug = payload?.slug || titleToSlug(post.title);
  const name = payload?.name || post.title;

  return {
    id: post.id,
    slug,
    name,
    description: payload?.description ?? "",
    descriptionHtml: payload?.descriptionHtml ?? stripPayloadComment(post.content),
    price: parsed.price,
    currency: parsed.currency ?? payload?.currency ?? "GHS",
    originalPrice: payload?.originalPrice,
    category: parsed.category ?? payload?.category ?? "electronics",
    collection: parsed.collection ?? payload?.collection,
    material: payload?.material ?? (parsed.materials[0] ?? ""),
    materials: parsed.materials.length ? parsed.materials : (payload?.materials ?? []),
    availability: parsed.availability ?? payload?.availability ?? "in-stock",
    badges: parsed.badges.length ? parsed.badges : (payload?.badges ?? []),
    images: payload?.images?.length
      ? payload.images
      : extractImagesFromHtml(post.content),
    attributes: parsed.attributes.length ? parsed.attributes : (payload?.attributes ?? []),
    publishedAt: post.published ?? payload?.publishedAt ?? post.updated ?? new Date().toISOString(),
    updatedAt: post.updated ?? payload?.updatedAt ?? new Date().toISOString(),
    status,
  };
}

function extractPayload(content: string): ProductPayload | null {
  const marker = `<!--${PAYLOAD_MARKER}:`;
  const start = content.indexOf(marker);
  if (start === -1) return null;
  const jsonStart = start + marker.length;
  const end = content.indexOf("-->", jsonStart);
  if (end === -1) return null;
  try {
    return JSON.parse(content.slice(jsonStart, end)) as ProductPayload;
  } catch {
    return null;
  }
}

function stripPayloadComment(content: string): string {
  const marker = `<!--${PAYLOAD_MARKER}:`;
  const start = content.indexOf(marker);
  if (start === -1) return content;
  const end = content.indexOf("-->", start);
  if (end === -1) return content;
  return (content.slice(0, start) + content.slice(end + 3)).trim();
}

function extractImagesFromHtml(html: string): ProductImage[] {
  const imgs: ProductImage[] = [];
  const re = /<img[^>]+src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    imgs.push({ url: m[1], alt: m[2] ?? undefined });
  }
  return imgs;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
