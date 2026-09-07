/**
 * Editorial blog post domain type.
 *
 * The blog lives in a SEPARATE Blogger blog from the product catalog
 * (BLOG_BLOGGER_BLOG_ID). Blog posts are plain articles — they do not
 * round-trip through the product label parser.
 */

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** sanitized HTML body */
  html: string;
  /** plain text body (for previews / search) */
  text: string;
  coverImage?: string;
  author?: string;
  authorUrl?: string;
  publishedAt: string;
  updatedAt: string;
  url?: string;
  labels?: string[];
}
