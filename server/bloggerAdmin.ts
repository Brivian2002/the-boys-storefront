import { __resetCatalogCache } from "./catalog";

export type ManagedPost = { id: string; title: string; content: string; labels: string[]; published?: string; updated?: string; url?: string };
export type ProductPostInput = { id?: string; title: string; description: string; price: number; currency: string; category: string; collection: string; materials: string[]; attributes?: Array<{ name: string; values: string[] }>; availability: "in-stock" | "out-of-stock" | "preorder" | "hidden"; featured?: boolean; newArrival?: boolean; sale?: boolean; imageUrls: string[]; publishNow: boolean };

function config() {
  const blogId = process.env.BLOGGER_BLOG_ID?.trim();
  const clientId = process.env.GOOGLE_BLOGGER_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_BLOGGER_CLIENT_SECRET?.trim();
  const refreshToken = process.env.GOOGLE_BLOGGER_REFRESH_TOKEN?.trim();
  if (!blogId || !clientId || !clientSecret || !refreshToken) throw new Error("Private Blogger management is not configured yet.");
  return { blogId, clientId, clientSecret, refreshToken };
}

async function accessToken() {
  const values = config();
  const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: values.clientId, client_secret: values.clientSecret, refresh_token: values.refreshToken, grant_type: "refresh_token" }) });
  const payload = await response.json() as { access_token?: string; error_description?: string };
  if (!response.ok || !payload.access_token) throw new Error(payload.error_description || "Google authorization could not be refreshed.");
  return { token: payload.access_token, blogId: values.blogId };
}

async function bloggerFetch(path: string, init: RequestInit = {}) {
  const { token, blogId } = await accessToken();
  const response = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${encodeURIComponent(blogId)}${path}`, { ...init, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init.headers ?? {}) } });
  const payload = response.status === 204 ? undefined : await response.json() as unknown;
  if (!response.ok) throw new Error("Blogger did not accept this operation.");
  return payload;
}

function compactLabel(value: string) { return value.trim().toLowerCase().replace(/^#/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80); }
function escapeHtml(value: string) { return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/\n/g, "<br>"); }
function validImage(url: string) { try { return new URL(url).protocol === "https:"; } catch { return false; } }
function attributeLabel(name: string, value: string) {
  const key = compactLabel(name).slice(0, 28);
  const item = compactLabel(value).slice(0, 38);
  return key && item ? `attribute-${key}--${item}` : undefined;
}

export function buildBloggerProductPayload(input: ProductPostInput) {
  const imageMarkup = input.imageUrls.filter(validImage).slice(0, 6).map(url => `<p><img src="${url}" alt="${escapeHtml(input.title)}"></p>`).join("");
  const customAttributes = (input.attributes ?? [])
    .flatMap(attribute => attribute.values.map(value => attributeLabel(attribute.name, value)))
    .filter((label): label is string => Boolean(label));
  return { title: input.title.trim(), content: `<p>${escapeHtml(input.description.trim())}</p>${imageMarkup}`, labels: ["product", `price-${input.price}`, `currency-${compactLabel(input.currency) || "NGN"}`, `category-${compactLabel(input.category) || "all-jewelry"}`, `collection-${compactLabel(input.collection) || "signature"}`, ...input.materials.map(compactLabel).filter(Boolean).map(material => `material-${material}`), ...Array.from(new Set(customAttributes)), `availability-${input.availability}`, ...(input.featured ? ["featured"] : []), ...(input.newArrival ? ["new-arrival"] : []), ...(input.sale ? ["sale"] : [])] };
}

export async function listManagedPosts(): Promise<ManagedPost[]> {
  const payload = await bloggerFetch("/posts?maxResults=100&fetchBodies=true") as { items?: ManagedPost[] };
  return Array.isArray(payload.items) ? payload.items : [];
}

export async function createProductPost(input: ProductPostInput) {
  const payload = await bloggerFetch(`/posts?isDraft=${input.publishNow ? "false" : "true"}`, { method: "POST", body: JSON.stringify(buildBloggerProductPayload(input)) });
  __resetCatalogCache();
  return payload as ManagedPost;
}

export async function updateProductPost(input: ProductPostInput & { id: string }) {
  const payload = await bloggerFetch(`/posts/${encodeURIComponent(input.id)}`, { method: "PATCH", body: JSON.stringify(buildBloggerProductPayload(input)) });
  __resetCatalogCache();
  return payload as ManagedPost;
}

export async function deleteProductPost(id: string) {
  await bloggerFetch(`/posts/${encodeURIComponent(id)}`, { method: "DELETE" });
  __resetCatalogCache();
  return { success: true } as const;
}
