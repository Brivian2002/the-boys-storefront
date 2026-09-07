/**
 * Admin product CRUD + order management.
 *
 * Product mutations write through to Blogger (the source of truth) and then
 * mirror the change into the local DB cache so the public storefront is
 * immediately consistent. Orders live in the DB only — they never touch
 * Blogger.
 *
 * When Blogger write credentials are NOT configured, product mutations
 * write to the DB cache only, so the admin can still demo the full flow
 * locally. A clear error is surfaced by the API layer in that case.
 */

import "server-only";
import { db } from "@/lib/db";
import {
  createPost,
  deletePost,
  fetchPost,
  fetchPosts,
  bloggerWriteConfigured,
  bloggerConfigured,
  publishPost,
  revertPost,
  updatePost,
  type BloggerPost,
} from "./api";
import { productToPost, postToProduct } from "./serializer";
import { titleToSlug } from "./parser";
import type { Product } from "./types";

export type AdminProduct = Product;

export interface SalesStats {
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  failedOrders: number;
  revenueMinor: number;
  currency: string;
  topProducts: { name: string; quantity: number; revenueMinor: number }[];
  recentOrders: {
    id: string;
    reference: string;
    status: string;
    amountMinor: number;
    currency: string;
    customerEmail: string;
    createdAt: string;
  }[];
}

function canWriteToBlogger(): boolean {
  return bloggerWriteConfigured();
}

/**
 * Pull all products (including drafts/hidden) for the admin dashboard.
 * Reads from the DB cache when present, otherwise from Blogger.
 */
export async function listAllProducts(): Promise<Product[]> {
  const cached = await db.product.findMany({
    include: { images: true, attributes: true },
    orderBy: { updatedAt: "desc" },
  });
  if (cached.length) {
    return cached.map(rowToProduct);
  }
  if (!bloggerConfigured()) return [];
  const { posts } = await fetchPosts({ maxResults: 500, fetchBodies: true });
  const products: Product[] = [];
  for (const post of posts) {
    const p = postToProduct(post);
    if (p) products.push(p);
  }
  return products;
}

export async function getAdminProduct(id: string): Promise<Product | null> {
  const row = await db.product.findUnique({
    where: { id },
    include: { images: true, attributes: true },
  });
  if (row) return rowToProduct(row);
  if (!bloggerConfigured()) return null;
  const post = await fetchPost(id);
  return post ? postToProduct(post) : null;
}

export interface ProductInput {
  name: string;
  description: string;
  descriptionHtml?: string;
  price: number;
  originalPrice?: number;
  currency: "GHS" | "USD";
  category: Product["category"];
  collection?: string;
  /** primary material; derived from materials[0] when omitted */
  material?: string;
  materials: string[];
  availability: Product["availability"];
  badges: Product["badges"];
  images: { url: string; alt?: string }[];
  attributes: { name: string; values: string[] }[];
  status: "published" | "draft" | "hidden";
}

function inputToProduct(id: string, input: ProductInput): Product {
  const now = new Date().toISOString();
  const materials = input.materials.length
    ? input.materials
    : input.material
      ? [input.material]
      : [];
  return {
    id,
    slug: titleToSlug(input.name),
    name: input.name,
    description: input.description,
    descriptionHtml: input.descriptionHtml,
    price: input.price,
    originalPrice: input.originalPrice,
    currency: input.currency,
    category: input.category,
    collection: input.collection,
    material: input.material ?? materials[0] ?? "",
    materials,
    availability: input.availability,
    badges: input.badges,
    images: input.images.map((img, i) => ({ ...img, position: i })),
    attributes: input.attributes,
    publishedAt: now,
    updatedAt: now,
    status: input.status,
  };
}

/**
 * Create a product. Writes to Blogger (when configured) then mirrors into DB.
 * When Blogger is not configured, writes to DB only and generates a cuid id.
 */
export async function createProduct(input: ProductInput): Promise<Product> {
  if (canWriteToBlogger()) {
    const tempId = `tmp-${Date.now()}`;
    const product = inputToProduct(tempId, input);
    const { title, content, labels } = productToPost(product);
    const post = await createPost({
      title,
      content,
      labels,
      isDraft: input.status !== "published",
    });
    const created = inputToProduct(post.id, input);
    await upsertProductInDb(created);
    return created;
  }

  // DB-only mode
  const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const product = inputToProduct(id, input);
  await upsertProductInDb(product);
  return product;
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
  const product = inputToProduct(id, input);
  if (canWriteToBlogger()) {
    const { title, content, labels } = productToPost(product);
    await updatePost(id, { title, content, labels, isDraft: input.status !== "published" });
  }
  await upsertProductInDb(product);
  return product;
}

export async function deleteProduct(id: string): Promise<void> {
  if (canWriteToBlogger()) {
    try {
      await deletePost(id);
    } catch (err) {
      // If the post is already gone in Blogger, swallow and continue cleaning DB.
      if (!/404/.test(String(err))) throw err;
    }
  }
  await db.product.delete({ where: { id } }).catch(() => undefined);
}

export async function setProductStatus(
  id: string,
  status: "published" | "draft" | "hidden"
): Promise<Product> {
  if (canWriteToBlogger()) {
    if (status === "published") {
      await publishPost(id).catch(async () => {
        // publish may fail if already live — fall through to update
      });
    } else {
      await revertPost(id).catch(() => undefined);
    }
  }
  const updated = await db.product.update({
    where: { id },
    data: { status },
    include: { images: true, attributes: true },
  });
  return rowToProduct(updated);
}

async function upsertProductInDb(product: Product): Promise<void> {
  await db.$transaction(async (tx) => {
    await tx.productAttribute.deleteMany({ where: { productId: product.id } });
    await tx.productImage.deleteMany({ where: { productId: product.id } });

    await tx.product.upsert({
      where: { id: product.id },
      update: {
        slug: product.slug,
        name: product.name,
        description: product.description,
        descriptionHtml: product.descriptionHtml ?? "",
        price: product.price,
        originalPrice: product.originalPrice ?? null,
        currency: product.currency,
        category: product.category,
        collection: product.collection ?? null,
        materials: JSON.stringify(product.materials),
        availability: product.availability,
        badges: JSON.stringify(product.badges),
        status: product.status,
        publishedAt: product.publishedAt ? new Date(product.publishedAt) : null,
      },
      create: {
        id: product.id,
        slug: product.slug,
        name: product.name,
        description: product.description,
        descriptionHtml: product.descriptionHtml ?? "",
        price: product.price,
        originalPrice: product.originalPrice ?? null,
        currency: product.currency,
        category: product.category,
        collection: product.collection ?? null,
        materials: JSON.stringify(product.materials),
        availability: product.availability,
        badges: JSON.stringify(product.badges),
        status: product.status,
        publishedAt: product.publishedAt ? new Date(product.publishedAt) : null,
      },
    });

    if (product.images.length) {
      await tx.productImage.createMany({
        data: product.images.map((img, i) => ({
          url: img.url,
          alt: img.alt ?? null,
          position: img.position ?? i,
          productId: product.id,
        })),
      });
    }
    if (product.attributes.length) {
      await tx.productAttribute.createMany({
        data: product.attributes.map((a) => ({
          name: a.name,
          values: JSON.stringify(a.values),
          productId: product.id,
        })),
      });
    }
  });
}

function rowToProduct(row: {
  id: string;
  slug: string;
  name: string;
  description: string;
  descriptionHtml: string;
  price: number;
  originalPrice: number | null;
  currency: string;
  category: string;
  collection: string | null;
  materials: string;
  availability: string;
  badges: string;
  status: string;
  publishedAt: Date | null;
  updatedAt: Date;
  images: { url: string; alt: string | null; position: number }[];
  attributes: { name: string; values: string }[];
}): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    descriptionHtml: row.descriptionHtml || undefined,
    price: row.price,
    originalPrice: row.originalPrice ?? undefined,
    currency: row.currency as Product["currency"],
    category: row.category as Product["category"],
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

// ============================================================
// ORDERS (DB only — never touch Blogger)
// ============================================================

export async function listOrders(opts?: { limit?: number; status?: string }) {
  const orders = await db.order.findMany({
    where: opts?.status ? { status: opts.status } : undefined,
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: opts?.limit ?? 100,
  });
  return orders.map((o) => ({
    id: o.id,
    reference: o.reference,
    status: o.status,
    amountMinor: o.amountMinor,
    currency: o.currency,
    customerEmail: o.customerEmail,
    deliveryName: o.deliveryName,
    deliveryPhone: o.deliveryPhone,
    deliveryRegion: o.deliveryRegion,
    deliveryAddress: o.deliveryAddress,
    notes: o.notes,
    paystackChannel: o.paystackChannel,
    paidAt: o.paidAt?.toISOString() ?? null,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    items: o.items.map((it) => ({
      id: it.id,
      orderId: it.orderId,
      productId: it.productId,
      name: it.name,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
    })),
  }));
}

export async function getSalesStats(): Promise<SalesStats> {
  const orders = await db.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const paid = orders.filter((o) => o.status === "paid");
  const revenueMinor = paid.reduce((sum, o) => sum + o.amountMinor, 0);

  const productAgg = new Map<string, { name: string; quantity: number; revenueMinor: number }>();
  for (const o of paid) {
    for (const it of o.items) {
      const key = it.productId ?? it.name;
      const entry = productAgg.get(key) ?? {
        name: it.name,
        quantity: 0,
        revenueMinor: 0,
      };
      entry.quantity += it.quantity;
      entry.revenueMinor += Math.round(it.unitPrice * 100) * it.quantity;
      productAgg.set(key, entry);
    }
  }
  const topProducts = Array.from(productAgg.values())
    .sort((a, b) => b.revenueMinor - a.revenueMinor)
    .slice(0, 5);

  return {
    totalOrders: orders.length,
    paidOrders: paid.length,
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    failedOrders: orders.filter((o) => o.status === "failed").length,
    revenueMinor,
    currency: "GHS",
    topProducts,
    recentOrders: orders.slice(0, 10).map((o) => ({
      id: o.id,
      reference: o.reference,
      status: o.status,
      amountMinor: o.amountMinor,
      currency: o.currency,
      customerEmail: o.customerEmail,
      createdAt: o.createdAt.toISOString(),
    })),
  };
}

export type { BloggerPost };
