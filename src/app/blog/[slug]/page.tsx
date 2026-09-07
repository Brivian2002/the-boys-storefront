import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PublicShell } from "@/components/public/shell";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getBlogPosts, getBlogPostBySlug } from "@/lib/blog/client";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getBlogPosts(100).catch(() => []);
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug).catch(() => null);
  if (!post) {
    return {
      title: "Post not found",
      robots: { index: false, follow: false },
    };
  }
  const title = `${post.title} · Afrocentric Jewelry by LaGlitz`;
  const description = post.excerpt ?? post.title;
  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.publishedAt,
      ...(post.coverImage ? { images: [{ url: post.coverImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(post.coverImage ? { images: [post.coverImage] } : {}),
    },
  };
}

export const dynamic = "force-dynamic";

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug).catch(() => null);
  if (!post) notFound();

  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/blog">Journal</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{post.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
          <Link href="/blog">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to journal
          </Link>
        </Button>

        <header className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400 mb-3">
            {new Date(post.publishedAt).toLocaleDateString("en-GH", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.1] tracking-tight">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </header>

        {post.coverImage && (
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-border mb-8">
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {post.html ? (
          <div
            className="prose prose-lg max-w-none dark:prose-invert
              [&_p]:leading-relaxed [&_p]:my-4
              [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3
              [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2
              [&_a]:text-teal-600 [&_a]:dark:text-teal-400 [&_a]:underline
              [&_ul]:my-4 [&_ul]:list-disc [&_ul]:ml-6
              [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:ml-6
              [&_blockquote]:border-l-2 [&_blockquote]:border-teal-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground
              [&_img]:rounded-lg"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        ) : (
          <div className="text-muted-foreground leading-relaxed">
            {post.excerpt}
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <Button asChild variant="outline">
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              All posts
            </Link>
          </Button>
          <Button asChild>
            <Link href="/shop">
              Shop the collection
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </article>
    </PublicShell>
  );
}
