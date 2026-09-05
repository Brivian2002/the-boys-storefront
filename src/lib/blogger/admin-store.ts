import "server-only";
import { refreshCatalog, postToProduct, type BloggerPost } from "./client";
import { serializeProductToLabels } from "./parser";
import type { Availability, Badge, Category, Currency, CustomAttribute, Product } from "./types";

const BLOGGER_API = "https://www.googleapis.com/blogger/v3";
const OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";

type ProductDraft = {
  id?: string;
  name: string;
  description: string;
  descriptionHtml?: string;
  price: number;
  originalPrice?: number;
  currency: Currency;
  category: Category;
  collection?: string;
  materials: string[];
  availability: Availability;
  badges: Badge[];
  images: { url: string; alt?: string }[];
  attributes: CustomAttribute[];
  status: "published" | "draft" | "hidden";
};

async function accessToken() {
  const clientId = process.env.GOOGLE_BLOGGER_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_BLOGGER_CLIENT_SECRET?.trim();
  const refreshToken = process.env.GOOGLE_BLOGGER_REFRESH_TOKEN?.trim();
  if (!clientId || !clientSecret || !refreshToken) throw new Error("Blogger write access is not configured.");
  const response = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: "refresh_token" }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Blogger OAuth token request failed: ${response.status}`);
  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("Blogger OAuth token response did not include an access token.");
  return data.access_token;
}

async function bloggerRequest(path: string, init: RequestInit = {}) {
  const token = await accessToken();
  const response = await fetch(`${BLOGGER_API}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json", ...(init.headers ?? {}) },
    cache: "no-store",
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Blogger request failed (${response.status}): ${text.slice(0, 300)}`);
  }
  return response.json();
}

function blogId() {
  const id = process.env.BLOGGER_BLOG_ID?.trim();
  if (!id) throw new Error("BLOGGER_BLOG_ID is not configured.");
  return encodeURIComponent(id);
}

async function getPosts() {
  const data = (await bloggerRequest(`/blogs/${blogId()}/posts?fetchBodies=true&maxResults=500`)) as { items?: BloggerPost[] };
  return data.items ?? [];
}

function productHtml(draft: ProductDraft) {
  const escaped = draft.description.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const images = draft.images.map((image) => `<img src="${image.url.replace(/"/g, "&quot;")}" alt="${(image.alt ?? draft.name).replace(/"/g, "&quot;")}" />`).join("\n");
  const structured = { price: draft.price, originalPrice: draft.originalPrice, currency: draft.currency, collection: draft.collection, materials: draft.materials, availability: draft.availability, attributes: draft.attributes };
  return `<!-- LA_GLITZ_PRODUCT ${JSON.stringify(structured)} -->\n<p>${escaped}</p>\n${images}`;
}

function labelsFor(draft: ProductDraft) {
  return serializeProductToLabels({ price: draft.price, currency: draft.currency, category: draft.category, collection: draft.collection, materials: draft.materials, availability: draft.availability, badges: draft.badges, attributes: draft.attributes, hidden: draft.status === "hidden" });
}

function fromPost(post: BloggerPost) {
  return postToProduct(post);
}

export async function listAllProducts(): Promise<Product[]> {
  return (await getPosts()).map(fromPost).filter((product): product is Product => Boolean(product)).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

async function getPost(id: string) {
  return (await bloggerRequest(`/blogs/${blogId()}/posts/${encodeURIComponent(id)}?fetchBody=true`)) as BloggerPost;
}

export async function getAdminProduct(id: string) { return (await listAllProducts()).find((product) => product.id === id) ?? null; }

export async function createProduct(draft: ProductDraft) {
  const query = draft.status === "draft" ? "?isDraft=true" : "";
  const post = (await bloggerRequest(`/blogs/${blogId()}/posts${query}`, { method: "POST", body: JSON.stringify({ kind: "blogger#post", title: draft.name, content: productHtml(draft), labels: labelsFor(draft) }) })) as BloggerPost;
  await refreshCatalog();
  return fromPost(post);
}

export async function updateProduct(id: string, draft: ProductDraft) {
  const query = draft.status === "draft" ? "?isDraft=true" : "";
  const post = (await bloggerRequest(`/blogs/${blogId()}/posts/${encodeURIComponent(id)}${query}`, { method: "PUT", body: JSON.stringify({ kind: "blogger#post", id, title: draft.name, content: productHtml(draft), labels: labelsFor(draft) }) })) as BloggerPost;
  await refreshCatalog();
  return fromPost(post);
}

export async function deleteProduct(id: string) {
  await bloggerRequest(`/blogs/${blogId()}/posts/${encodeURIComponent(id)}`, { method: "DELETE" });
  await refreshCatalog();
}

export async function setProductStatus(id: string, status: Product["status"]) {
  const post = await getPost(id);
  const product = fromPost(post);
  if (!product) throw new Error("Blogger post is not a qualifying product.");
  return updateProduct(id, { id, name: product.name, description: product.description, price: product.price, currency: product.currency, category: product.category, collection: product.collection, materials: product.materials, availability: product.availability, badges: product.badges, images: product.images, attributes: product.attributes, status });
}

export async function toggleBadge(id: string, badge: Badge, enabled: boolean) {
  const post = await getPost(id);
  const product = fromPost(post);
  if (!product) throw new Error("Blogger post is not a qualifying product.");
  const badges = enabled ? Array.from(new Set([...product.badges, badge])) : product.badges.filter((value) => value !== badge);
  return updateProduct(id, { id, name: product.name, description: product.description, price: product.price, currency: product.currency, category: product.category, collection: product.collection, materials: product.materials, availability: product.availability, badges, images: product.images, attributes: product.attributes, status: product.status });
}

export interface SaleRecord { id: string; reference: string; amount: number; currency: Currency; channel: string; customerEmail: string; paidAt: string; demo: boolean; }

export async function listSales(): Promise<SaleRecord[]> {
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!secret) return [];
  const response = await fetch("https://api.paystack.co/transaction?status=success&perPage=100", { headers: { authorization: `Bearer ${secret}` }, cache: "no-store" });
  if (!response.ok) throw new Error(`Paystack sales request failed (${response.status})`);
  const data = (await response.json()) as { data?: Array<{ id: number; reference: string; amount: number; currency?: Currency; channel?: string; customer?: { email?: string }; paid_at?: string }> };
  return (data.data ?? []).map((sale) => ({ id: String(sale.id), reference: sale.reference, amount: sale.amount, currency: sale.currency ?? "GHS", channel: sale.channel ?? "unknown", customerEmail: sale.customer?.email ?? "", paidAt: sale.paid_at ?? "", demo: false }));
}

export async function getSalesStats() {
  const sales = await listSales();
  return { count: sales.length, totalGhs: sales.filter((sale) => sale.currency === "GHS").reduce((sum, sale) => sum + sale.amount / 100, 0), lastSaleAt: sales[0]?.paidAt ?? null, demo: false };
}

export async function recordSale(rec: Omit<SaleRecord, "id">): Promise<SaleRecord> {
  return { ...rec, id: `provider-${rec.reference}` };
}
