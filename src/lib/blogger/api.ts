/**
 * Real Blogger API v3 client with OAuth refresh-token flow.
 *
 * Reads are served via the public Blogger API key (or OAuth). Writes require
 * a Google OAuth refresh token (server-side) which is exchanged for a
 * short-lived access token on demand.
 *
 * This module is server-only — credentials must never reach the client.
 */

import "server-only";
import { env } from "@/lib/env";

const BLOGGER_BASE = "https://www.googleapis.com/blogger/v3";
const OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";

export interface BloggerPost {
  id: string;
  url?: string;
  title: string;
  content: string;
  published?: string;
  updated?: string;
  labels?: string[];
  status?: "LIVE" | "DRAFT" | "SCHEDULED" | "SOFT_TRASHED";
  author?: { id?: string; displayName?: string; url?: string };
  blog?: { id?: string };
}

interface ListResponse {
  items?: BloggerPost[];
  nextPageToken?: string;
  totalItems?: number;
}

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

/**
 * True when we can READ from Blogger (blog id + either api key or refresh token).
 */
export function bloggerConfigured(): boolean {
  const e = process.env;
  return Boolean(
    e.BLOGGER_BLOG_ID &&
      (e.BLOGGER_API_KEY || e.GOOGLE_BLOGGER_REFRESH_TOKEN)
  );
}

/**
 * True when we can WRITE to Blogger (full OAuth refresh-token flow configured).
 */
export function bloggerWriteConfigured(): boolean {
  const e = process.env;
  return Boolean(
    e.BLOGGER_BLOG_ID &&
      e.GOOGLE_BLOGGER_CLIENT_ID &&
      e.GOOGLE_BLOGGER_CLIENT_SECRET &&
      e.GOOGLE_BLOGGER_REFRESH_TOKEN
  );
}

/**
 * Exchange the long-lived refresh token for a short-lived access token.
 * Cached for the lifetime of the process (minus a 60s safety margin).
 */
async function getAccessToken(): Promise<string> {
  if (cachedAccessToken && Date.now() < cachedAccessToken.expiresAt) {
    return cachedAccessToken.token;
  }
  const e = env();
  if (
    !e.GOOGLE_BLOGGER_CLIENT_ID ||
    !e.GOOGLE_BLOGGER_CLIENT_SECRET ||
    !e.GOOGLE_BLOGGER_REFRESH_TOKEN
  ) {
    throw new Error(
      "Blogger write credentials are not configured (GOOGLE_BLOGGER_CLIENT_ID / CLIENT_SECRET / REFRESH_TOKEN)."
    );
  }

  const body = new URLSearchParams({
    client_id: e.GOOGLE_BLOGGER_CLIENT_ID,
    client_secret: e.GOOGLE_BLOGGER_CLIENT_SECRET,
    refresh_token: e.GOOGLE_BLOGGER_REFRESH_TOKEN,
    grant_type: "refresh_token",
  });

  const res = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Blogger OAuth refresh failed: ${res.status} ${text}`);
  }
  const json = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };
  cachedAccessToken = {
    token: json.access_token,
    expiresAt: Date.now() + (json.expires_in - 60) * 1000,
  };
  return cachedAccessToken.token;
}

function authHeader(accessToken?: string, apiKey?: string): Record<string, string> {
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (apiKey) headers.key = apiKey;
  return headers;
}

/**
 * Fetch published posts from a Blogger blog. Optionally override the blog id
 * (used by the editorial blog reader which may target a different blog).
 */
export async function fetchPosts(opts?: {
  blogIdOverride?: string;
  maxResults?: number;
  pageToken?: string;
  fetchBodies?: boolean;
  labels?: string;
}): Promise<{ posts: BloggerPost[]; nextPageToken?: string; totalItems?: number }> {
  const e = env();
  const blogId = opts?.blogIdOverride ?? e.BLOGGER_BLOG_ID;
  if (!blogId) {
    throw new Error("BLOGGER_BLOG_ID is not configured.");
  }
  const useOAuth = Boolean(e.GOOGLE_BLOGGER_REFRESH_TOKEN);
  const headers: Record<string, string> = {};
  if (useOAuth) {
    headers.Authorization = `Bearer ${await getAccessToken()}`;
  } else if (e.BLOGGER_API_KEY) {
    headers.key = e.BLOGGER_API_KEY;
  } else {
    throw new Error(
      "Blogger read requires either BLOGGER_API_KEY or GOOGLE_BLOGGER_REFRESH_TOKEN."
    );
  }

  const params = new URLSearchParams({
    maxResults: String(opts?.maxResults ?? 500),
    fetchBodies: String(opts?.fetchBodies ?? true),
    view: "AUTHOR",
    status: "live",
  });
  if (opts?.pageToken) params.set("pageToken", opts.pageToken);
  if (opts?.labels) params.set("labels", opts.labels);

  const url = `${BLOGGER_BASE}/blogs/${blogId}/posts?${params.toString()}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Blogger fetchPosts failed: ${res.status} ${text}`);
  }
  const json = (await res.json()) as ListResponse;
  return {
    posts: json.items ?? [],
    nextPageToken: json.nextPageToken,
    totalItems: json.totalItems,
  };
}

/**
 * Fetch a single post by id.
 */
export async function fetchPost(
  postId: string,
  opts?: { blogIdOverride?: string }
): Promise<BloggerPost | null> {
  const e = env();
  const blogId = opts?.blogIdOverride ?? e.BLOGGER_BLOG_ID;
  if (!blogId) {
    throw new Error("BLOGGER_BLOG_ID is not configured.");
  }
  const headers: Record<string, string> = {};
  if (e.GOOGLE_BLOGGER_REFRESH_TOKEN) {
    headers.Authorization = `Bearer ${await getAccessToken()}`;
  } else if (e.BLOGGER_API_KEY) {
    headers.key = e.BLOGGER_API_KEY;
  } else {
    throw new Error("Blogger read requires API key or OAuth refresh token.");
  }
  const url = `${BLOGGER_BASE}/blogs/${blogId}/posts/${encodeURIComponent(
    postId
  )}?view=AUTHOR`;
  const res = await fetch(url, { headers });
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Blogger fetchPost failed: ${res.status} ${text}`);
  }
  return (await res.json()) as BloggerPost;
}

export interface PostInput {
  title: string;
  content: string;
  labels?: string[];
  /** when false the post is saved as a DRAFT */
  isDraft?: boolean;
}

/**
 * Create a new post. Requires OAuth write credentials.
 */
export async function createPost(input: PostInput, opts?: { blogIdOverride?: string }): Promise<BloggerPost> {
  const e = env();
  const blogId = opts?.blogIdOverride ?? e.BLOGGER_BLOG_ID;
  if (!blogId) throw new Error("BLOGGER_BLOG_ID is not configured.");
  const accessToken = await getAccessToken();
  const url = `${BLOGGER_BASE}/blogs/${blogId}/posts/?isDraft=${input.isDraft ? "true" : "false"}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      kind: "blogger#post",
      title: input.title,
      content: input.content,
      labels: input.labels,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Blogger createPost failed: ${res.status} ${text}`);
  }
  return (await res.json()) as BloggerPost;
}

/**
 * Update an existing post (title, content, labels).
 */
export async function updatePost(
  postId: string,
  input: PostInput,
  opts?: { blogIdOverride?: string }
): Promise<BloggerPost> {
  const e = env();
  const blogId = opts?.blogIdOverride ?? e.BLOGGER_BLOG_ID;
  if (!blogId) throw new Error("BLOGGER_BLOG_ID is not configured.");
  const accessToken = await getAccessToken();
  const url = `${BLOGGER_BASE}/blogs/${blogId}/posts/${encodeURIComponent(postId)}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      kind: "blogger#post",
      id: postId,
      blog: { id: blogId },
      title: input.title,
      content: input.content,
      labels: input.labels,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Blogger updatePost failed: ${res.status} ${text}`);
  }
  return (await res.json()) as BloggerPost;
}

/**
 * Publish a draft post (move from DRAFT to LIVE).
 */
export async function publishPost(
  postId: string,
  opts?: { blogIdOverride?: string }
): Promise<BloggerPost> {
  const e = env();
  const blogId = opts?.blogIdOverride ?? e.BLOGGER_BLOG_ID;
  if (!blogId) throw new Error("BLOGGER_BLOG_ID is not configured.");
  const accessToken = await getAccessToken();
  const url = `${BLOGGER_BASE}/blogs/${blogId}/posts/${encodeURIComponent(postId)}/publish`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Blogger publishPost failed: ${res.status} ${text}`);
  }
  return (await res.json()) as BloggerPost;
}

/**
 * Revert a live post back to draft.
 */
export async function revertPost(
  postId: string,
  opts?: { blogIdOverride?: string }
): Promise<BloggerPost> {
  const e = env();
  const blogId = opts?.blogIdOverride ?? e.BLOGGER_BLOG_ID;
  if (!blogId) throw new Error("BLOGGER_BLOG_ID is not configured.");
  const accessToken = await getAccessToken();
  const url = `${BLOGGER_BASE}/blogs/${blogId}/posts/${encodeURIComponent(postId)}/revert`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Blogger revertPost failed: ${res.status} ${text}`);
  }
  return (await res.json()) as BloggerPost;
}

/**
 * Permanently delete a post.
 */
export async function deletePost(
  postId: string,
  opts?: { blogIdOverride?: string }
): Promise<void> {
  const e = env();
  const blogId = opts?.blogIdOverride ?? e.BLOGGER_BLOG_ID;
  if (!blogId) throw new Error("BLOGGER_BLOG_ID is not configured.");
  const accessToken = await getAccessToken();
  const url = `${BLOGGER_BASE}/blogs/${blogId}/posts/${encodeURIComponent(postId)}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    throw new Error(`Blogger deletePost failed: ${res.status} ${text}`);
  }
}

export { authHeader };
