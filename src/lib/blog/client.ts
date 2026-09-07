/**
 * Editorial blog reader.
 *
 * Reads from a separate Blogger blog (BLOG_BLOGGER_BLOG_ID). When the blog
 * is not configured, getBlogPosts returns an empty array and the public
 * blog sections simply don't render.
 */

import "server-only";
import { fetchPosts, fetchPost, type BloggerPost } from "@/lib/blogger/api";
import { titleToSlug } from "@/lib/blogger/parser";
import type { BlogPost } from "./types";

export function blogConfigured(): boolean {
  return Boolean(process.env.BLOG_BLOGGER_BLOG_ID);
}

function stripHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function excerptFrom(text: string, max = 200): string {
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  return `${slice.slice(0, lastSpace > 80 ? lastSpace : max)}…`;
}

function firstImage(html: string): string | undefined {
  const m = /<img[^>]+src=["']([^"']+)["']/i.exec(html);
  return m?.[1];
}

function postToBlogPost(post: BloggerPost): BlogPost {
  const text = stripHtml(post.content ?? "");
  return {
    id: post.id,
    slug: titleToSlug(post.title),
    title: post.title,
    excerpt: excerptFrom(text),
    html: post.content ?? "",
    text,
    coverImage: firstImage(post.content ?? ""),
    author: post.author?.displayName,
    authorUrl: post.author?.url,
    publishedAt: post.published ?? post.updated ?? new Date().toISOString(),
    updatedAt: post.updated ?? post.published ?? new Date().toISOString(),
    url: post.url,
    labels: post.labels,
  };
}

export async function getBlogPosts(limit = 20): Promise<BlogPost[]> {
  if (!blogConfigured()) return [];
  try {
    const { posts } = await fetchPosts({
      maxResults: limit,
      fetchBodies: true,
      blogIdOverride: process.env.BLOG_BLOGGER_BLOG_ID,
    });
    return posts.map(postToBlogPost).sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  } catch {
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getBlogPosts(100);
  return posts.find((p) => p.slug === slug) ?? null;
}
