import { redirect } from "next/navigation";
import Link from "next/link";
import { Newspaper, ArrowRight, Info } from "lucide-react";
import { getSession } from "@/lib/auth/admin-session";
import { AdminShell } from "@/components/admin/admin-shell";
import { blogConfigured, getBlogPosts } from "@/lib/blog/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const configured = blogConfigured();
  const posts = await getBlogPosts(50).catch(() => []);

  return (
    <AdminShell
      active="blog"
      title="Blog posts"
      description="Editorial blog posts from the connected Blogger blog"
      session={session}
    >
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Editorial blog status
          </CardTitle>
          <CardDescription>
            The editorial blog is a separate Blogger blog identified by{" "}
            <code className="rounded bg-muted px-1 text-xs">
              BLOG_BLOGGER_BLOG_ID
            </code>
            .
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className={
                configured
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                  : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
              }
            >
              {configured ? "Connected" : "Not configured"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {configured
                ? "Blog posts will appear on /blog."
                : "Set BLOG_BLOGGER_BLOG_ID in your environment to enable the editorial blog."}
            </span>
          </div>

          {!configured && (
            <div className="flex items-start gap-2 rounded-md border border-teal-500/30 bg-blue-600/5 p-3 text-xs text-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <p>
                The editorial blog is optional. When not configured, the public
                blog index at <code className="rounded bg-muted px-1">/blog</code>{" "}
                shows a graceful &ldquo;coming soon&rdquo; state and the home
                page hides the blog section.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent posts</CardTitle>
          <CardDescription>
            {posts.length} {posts.length === 1 ? "post" : "posts"} fetched
            from the configured blog.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Newspaper className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">No posts available</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {configured
                    ? "Publish a post in your Blogger dashboard and refresh."
                    : "Configure BLOG_BLOGGER_BLOG_ID to fetch posts."}
                </p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {posts.slice(0, 10).map((p) => (
                <li key={p.id} className="py-3">
                  <Link
                    href={`/blog/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {p.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(p.publishedAt).toLocaleDateString("en-GH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                        {p.author ? ` · ${p.author}` : ""}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <Button asChild variant="outline">
          <Link href="/blog" target="_blank" rel="noopener noreferrer">
            View blog on store
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </AdminShell>
  );
}
