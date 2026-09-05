import type { Metadata } from "next";

export const dynamic = "force-dynamic";

// Hard noindex for the entire /admin subtree. Belt-and-braces: we set
// the meta robots here AND each page sets its own noindex via the
// metadata API. The login page is also noindexed.
export const metadata: Metadata = {
  title: {
    default: "Admin · LA GLITZ",
    template: "%s · LA GLITZ Admin",
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The metadata export above handles the noindex meta tag. We render a
  // plain wrapper; the login page renders chrome-free and each protected
  // page wraps its content in <AdminShell>.
  return <div className="min-h-screen bg-background">{children}</div>;
}
