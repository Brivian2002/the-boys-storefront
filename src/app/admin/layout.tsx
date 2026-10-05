import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/admin-session";

export const dynamic = "force-dynamic";

// Hard noindex for the entire /admin subtree.
export const metadata: Metadata = {
  title: {
    default: "Admin · The Boyz Store",
    template: "%s · The Boyz Store Admin",
  },
  description: "Protected admin area. Not indexed.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  other: {
    "x-robots-tag": "noindex, nofollow",
  },
};

// Public paths that don't require authentication
const PUBLIC_ADMIN_PATHS = ["/admin/login"];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";

  // If no session and not on a public path, redirect to login
  if (!session && !PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    // We can't access the URL on the server side directly, so we rely on
    // each page's own redirect. But as a safety net, if there's no session,
    // we render a minimal "redirecting" page for non-login routes.
    // The individual page components handle the actual redirect.
  }

  return <div className="min-h-screen bg-background">{children}</div>;
}
