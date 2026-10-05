import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ArrowRight } from "lucide-react";
import type { BlogPost } from "@/lib/blog/types";

interface BlogCardProps {
  post: BlogPost;
}

/**
 * Card for an editorial blog post. Used on the home page blog strip and any
 * blog index. Renders nothing fancy when there's no cover image.
 */
export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card hover-lift">
      {post.coverImage ? (
        <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/9] overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            unoptimized
          />
        </Link>
      ) : (
        <Link
          href={`/blog/${post.slug}`}
          className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-turquoise-soft to-gold-soft"
          aria-label={post.title}
        >
          <span className="font-serif text-3xl text-turquoise">The Boys Store</span>
        </Link>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" />
          {new Date(post.publishedAt).toLocaleDateString("en-GH", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
          {post.author && <span>· {post.author}</span>}
        </div>
        <h3 className="font-serif text-lg font-semibold leading-snug tracking-tight">
          <Link href={`/blog/${post.slug}`} className="hover:text-turquoise">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
          {post.excerpt}
        </p>
        <Link
          href={`/blog/${post.slug}`}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-turquoise hover:gap-2 transition-all"
        >
          Read article
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
