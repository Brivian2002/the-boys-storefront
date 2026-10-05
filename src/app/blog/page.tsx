import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { PublicShell } from "@/components/public/shell";
import { BlogCard } from "@/components/public/blog-card";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getBlogPosts, blogConfigured } from "@/lib/blog/client";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Stories, craftsmanship and inspiration from The Boyz Store.",
  alternates: { canonical: "/blog" },
};

export const dynamic = "force-dynamic";

export default async function BlogIndexPage() {
  const [posts, configured] = await Promise.all([
    getBlogPosts(50).catch(() => []),
    blogConfigured(),
  ]);

  return (
    <PublicShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Journal</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-3">
            From the journal
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight">
            Stories &amp; craftsmanship.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Adinkra symbolism, the warmth of African gold, the rhythm of
            Ghanaian celebration — the stories behind our craft.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 px-4">
            <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <BookOpen className="h-7 w-7" />
            </div>
            <h2 className="font-serif text-2xl font-semibold mb-2">
              {configured ? "No posts yet" : "Journal coming soon"}
            </h2>
            <p className="text-muted-foreground max-w-md mb-6">
              {configured
                ? "We haven't published any stories yet. Please check back soon."
                : "We're preparing stories on Adinkra symbolism, our craft and the Smart shopping, simply spirit. Please check back soon."}
            </p>
            <Button asChild>
              <Link href="/shop">
                Explore the collection
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <BlogCard key={p.slug} post={p} />
            ))}
          </div>
        )}
      </section>
    </PublicShell>
  );
}
