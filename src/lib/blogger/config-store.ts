import "server-only";
import { GHANA_REGIONS, STORE_CONTACT, type DeliveryRegion } from "@/lib/ghana";

const BLOGGER_API = "https://www.googleapis.com/blogger/v3";
const OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const CONFIG_LABEL = "la-glitz-config";
const CONFIG_TITLE = "LA GLITZ — Private Store Configuration";

export interface StoreConfig {
  regions: DeliveryRegion[];
  contact: typeof STORE_CONTACT;
}

const defaults: StoreConfig = { regions: GHANA_REGIONS, contact: STORE_CONTACT };

async function token() {
  const clientId = process.env.GOOGLE_BLOGGER_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_BLOGGER_CLIENT_SECRET?.trim();
  const refreshToken = process.env.GOOGLE_BLOGGER_REFRESH_TOKEN?.trim();
  if (!clientId || !clientSecret || !refreshToken) throw new Error("Blogger write access is not configured.");
  const response = await fetch(OAUTH_TOKEN_URL, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: "refresh_token" }), cache: "no-store" });
  if (!response.ok) throw new Error(`Blogger OAuth token request failed: ${response.status}`);
  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("Blogger OAuth token response did not include an access token.");
  return data.access_token;
}

function blogId() { const id = process.env.BLOGGER_BLOG_ID?.trim(); if (!id) throw new Error("BLOGGER_BLOG_ID is not configured."); return encodeURIComponent(id); }

async function request(path: string, init: RequestInit = {}) {
  const response = await fetch(`${BLOGGER_API}${path}`, { ...init, headers: { authorization: `Bearer ${await token()}`, "content-type": "application/json", ...(init.headers ?? {}) }, cache: "no-store" });
  if (!response.ok) throw new Error(`Blogger configuration request failed (${response.status}).`);
  return response.json();
}

function content(config: StoreConfig) { return `<!-- LA_GLITZ_CONFIG -->\n<pre>${JSON.stringify(config)}</pre>`; }
function extract(raw: string): StoreConfig | null { const match = raw.match(/<pre>([\s\S]*?)<\/pre>/i); if (!match) return null; try { const parsed = JSON.parse(match[1]) as StoreConfig; if (!Array.isArray(parsed.regions) || !parsed.contact) return null; return parsed; } catch { return null; } }

async function findConfigPost() {
  const data = (await request(`/blogs/${blogId()}/posts?labels=${encodeURIComponent(CONFIG_LABEL)}&fetchBodies=true&maxResults=10`)) as { items?: Array<{ id: string; title: string; content?: string; labels?: string[] }> };
  return data.items?.[0] ?? null;
}

export async function getStoreConfig(): Promise<StoreConfig> {
  if (!process.env.BLOGGER_BLOG_ID || !process.env.GOOGLE_BLOGGER_REFRESH_TOKEN) return defaults;
  try { const post = await findConfigPost(); return post?.content ? extract(post.content) ?? defaults : defaults; } catch { return defaults; }
}

export async function saveStoreConfig(config: StoreConfig) {
  const post = await findConfigPost();
  const payload = { kind: "blogger#post", title: CONFIG_TITLE, content: content(config), labels: [CONFIG_LABEL] };
  if (post) await request(`/blogs/${blogId()}/posts/${encodeURIComponent(post.id)}`, { method: "PUT", body: JSON.stringify({ ...payload, id: post.id }) });
  else await request(`/blogs/${blogId()}/posts?isDraft=true`, { method: "POST", body: JSON.stringify(payload) });
  return config;
}
