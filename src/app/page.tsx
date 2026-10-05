import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  ShoppingBasket,
  Smartphone,
  Shirt,
  Home,
  Headphones,
  Dumbbell,
  Wrench,
  Package,
  Sparkles,
  LockKeyhole,
  RotateCcw,
  LifeBuoy,
  Quote,
  Heart,
  Search,
} from "lucide-react";
import { PublicShell } from "@/components/public/shell";
import { ProductCard } from "@/components/public/product-card";
import { ReviewsWidget } from "@/components/public/reviews-widget";
import { BlogCard } from "@/components/public/blog-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getFeaturedProducts,
  getNewArrivals,
  queryCatalog,
  getActiveCategories,
} from "@/lib/blogger/client";
import {
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
  type Category,
  type CatalogQuery,
} from "@/lib/blogger/types";
import type { LucideIcon } from "lucide-react";
import { getBlogPosts } from "@/lib/blog/client";
import { STORE_CONTACT } from "@/lib/ghana";

const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  electronics: Smartphone,
  fashion: Shirt,
  home: Home,
  gadgets: Headphones,
  sports: Dumbbell,
  services: Wrench,
  bundles: Package,
  "new-arrivals": Sparkles,
};

const CATEGORY_ACCENTS: Record<Category, string> = {
  electronics: "bg-blue-600 text-white",
  fashion: "bg-violet-600 text-white",
  home: "bg-emerald-600 text-white",
  gadgets: "bg-cyan-600 text-white",
  sports: "bg-orange-500 text-white",
  services: "bg-slate-900 text-white",
  bundles: "bg-amber-500 text-slate-950",
  "new-arrivals": "bg-rose-500 text-white",
};

export const metadata = {
  title: "The Boyz Store — Smart shopping, simply",
  description:
    "The Boyz Store is a professional online marketplace for products, services, and smart everyday finds, founded by Joshua Nasi Words.",
};

function ProductRow({
  eyebrow,
  title,
  products,
}: {
  eyebrow: string;
  title: string;
  products: Awaited<ReturnType<typeof getFeaturedProducts>>;
}) {
  if (!products.length) return null;
  return (
    <section className="border-y border-border bg-muted/25">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">{eyebrow}</p>
            <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
          </div>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/shop">Shop all <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-5">
          {products.slice(0, 4).map((product, index) => <ProductCard key={product.id} product={product} priority={index < 2} />)}
        </div>
      </div>
    </section>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
  const browseQuery: CatalogQuery = {
    search: first(sp.q),
    category: first(sp.category) as CatalogQuery["category"],
    sort: (first(sp.sort) as CatalogQuery["sort"]) ?? "popular",
    page: 1,
    pageSize: 12,
  };
  const [featured, activeCats, posts, newArrivals, dealCatalog, browseCatalog] = await Promise.all([
    getFeaturedProducts(8),
    getActiveCategories(),
    getBlogPosts(3).catch(() => []),
    getNewArrivals(8),
    queryCatalog({ sort: "popular", pageSize: 32 }),
    queryCatalog(browseQuery),
  ]);
  const bestDeals = dealCatalog.products.filter(
    (product) => product.originalPrice && product.originalPrice > product.price
  );

  // Keep the full department system visible even before inventory is loaded
  const allCategories: Category[] = [
    "electronics",
    "fashion",
    "home",
    "gadgets",
    "sports",
    "services",
    "bundles",
    "new-arrivals",
  ];
  const categoryRows = allCategories.map((category) => {
    const row = activeCats.find((c) => c.category === category);
    return { category, count: row?.count ?? 0 };
  });

  return (
    <PublicShell>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/hero/boyz-marketplace-hero.jpg"
            alt="The Boyz Store marketplace campaign"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[38vh] max-h-[520px] flex-col justify-center py-12 sm:min-h-[46vh] sm:py-16">
            <div className="max-w-2xl">
              <Badge
                variant="secondary"
                className="mb-5 bg-white/10 text-white border-white/20 backdrop-blur-sm"
              >
                <Sparkles className="h-3 w-3 mr-1.5" />
                Smart shopping, simply · Products, services & everyday finds
              </Badge>
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight text-white">
                Shop better,
                <br />
                <span className="bg-gradient-to-r from-sky-300 via-blue-200 to-white bg-clip-text text-transparent">
                  Quality finds, delivered across Ghana.
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-white/85 leading-relaxed">
                The Boyz Store is a modern marketplace founded by{" "}
                <span className="text-white font-medium">Joshua Nasi Words</span>.
                Shop useful products, discover trusted services, and find
                standout deals across the categories that matter every day.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="text-base">
                  <Link href="/shop">
                    Shop the marketplace
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* trust strip */}
              <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/80">
                <span className="inline-flex items-center gap-2">
                  <LockKeyhole className="h-4 w-4 text-blue-300" />
                  Secure payment
                </span>
                <span className="inline-flex items-center gap-2">
                  <Truck className="h-4 w-4 text-blue-300" />
                  Ghana delivery
                </span>
                <span className="inline-flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-blue-300" />
                  Easy returns
                </span>
                <span className="inline-flex items-center gap-2">
                  <LifeBuoy className="h-4 w-4 text-blue-300" />
                  Friendly support
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SHOP-FIRST MARKETPLACE ===== */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8" id="marketplace">
        <div className="flex flex-col gap-5 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">The marketplace</p>
            <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">Browse products from the start</h2>
            <p className="mt-2 text-sm text-muted-foreground">{browseCatalog.total} {browseCatalog.total === 1 ? "listing" : "listings"} across everyday departments.</p>
          </div>
          <form action="/" method="get" role="search" className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input name="q" defaultValue={first(sp.q) ?? ""} placeholder="Search the marketplace..." className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-24 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" aria-label="Search the marketplace" />
            <button type="submit" className="absolute right-1.5 top-1/2 h-8 -translate-y-1/2 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700">Search</button>
          </form>
        </div>
        <div className="flex gap-2 overflow-x-auto py-5 scrollbar-none" aria-label="Quick departments">
          <Link href="/#marketplace" className="shrink-0 rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background">All products</Link>
          {allCategories.map((category) => (
            <Link key={category} href={`/?category=${category}#marketplace`} className="shrink-0 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground transition hover:border-blue-400 hover:text-blue-600">
              {CATEGORY_LABELS[category]}
            </Link>
          ))}
          <Link href="/shop" className="shrink-0 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">More filters</Link>
        </div>
        {browseCatalog.products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {browseCatalog.products.map((product, index) => (
              <div key={product.id} className="animate-fade-up" style={{ animationDelay: `${index * 45}ms` }}>
                <ProductCard product={product} priority={index < 4} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
            <p className="font-serif text-2xl font-semibold">Your marketplace is ready for its first listings.</p>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">Add products from the admin catalogue and they will appear here automatically, grouped by department and searchable from the home page.</p>
            <Button asChild className="mt-5"><Link href="/admin/products">Open catalogue</Link></Button>
          </div>
        )}
        {browseCatalog.total > browseCatalog.products.length && (
          <div className="mt-8 text-center"><Button asChild variant="outline"><Link href="/shop">View the full catalogue <ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div>
        )}
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="flex items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-2">
              Shop by category
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight">
              Find your next useful thing
            </h2>
          </div>
          <Button asChild variant="ghost" className="hidden sm:inline-flex shrink-0">
            <Link href="/shop">
              View all
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {categoryRows.map(({ category, count }) => {
            const Icon = CATEGORY_ICONS[category];
            return (
              <Link
                key={category}
                href={`/shop?category=${category}`}
                className="group rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/10 sm:p-5"
              >
                <div className={`mb-10 flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110 ${CATEGORY_ACCENTS[category]}`}>
                  <Icon className="h-6 w-6" strokeWidth={1.8} />
                </div>
                <h3 className="font-serif text-lg font-semibold leading-tight">
                  {CATEGORY_LABELS[category]}
                </h3>
                <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-relaxed text-muted-foreground">
                  {CATEGORY_DESCRIPTIONS[category]}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <span>{count > 0 ? `${count} ${count === 1 ? "listing" : "listings"}` : "Explore department"}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <ProductRow eyebrow="Trending now" title="Popular picks for everyday life" products={featured} />
      <ProductRow eyebrow="Fresh on the marketplace" title="New arrivals" products={newArrivals} />
      <ProductRow eyebrow="Better value" title="Best deals" products={bestDeals} />

      {/* ===== BRAND STORY ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid gap-10 lg:gap-16 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border">
            <Image
              src="/hero/boyz-marketplace-story.jpg"
              alt="The Boyz Store fulfillment workspace"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
              Our story
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
              Founded by Joshua Nasi Words.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The Boyz Store was founded on a simple belief: shopping online
              should feel clear, useful, and dependable. Joshua Nasi Words
              created this marketplace to bring products and services together
              in one professional destination for everyday life.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We keep the experience straightforward: discover, compare, and
              buy with confidence.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild>
                <Link href="/about">
                  Meet the founder
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/contact">Talk to the team</Link>
              </Button>
            </div>

            {/* quote */}
            <blockquote className="mt-6 border-l-2 border-blue-600 pl-4">
              <Quote className="h-5 w-5 text-blue-600 mb-2" />
              <p className="font-serif text-lg italic text-foreground/90">
                &ldquo;Smart shopping, simply — made for the way you live, work, and move.&rdquo;
              </p>
              <footer className="mt-2 text-sm text-muted-foreground">
                — Joshua Nasi Words, Founder
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* ===== REVIEWS ===== */}
      <ReviewsWidget />

      {/* ===== BLOG ===== */}
      {posts.length > 0 && (
        <section className="bg-muted/30 border-y border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="flex items-end justify-between mb-10 gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-2">
                  From the journal
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight">
                  Stories &amp; craftsmanship
                </h2>
              </div>
              <Button asChild variant="ghost" className="hidden sm:inline-flex shrink-0">
                <Link href="/blog">
                  Read all
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <BlogCard key={p.slug} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== VALUE PROPS ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: ShoppingBasket,
              title: "Marketplace built for real life",
              body: "Every listing is selected to make everyday shopping more useful and convenient.",
            },
            {
              icon: ShieldCheck,
              title: "Trusted shopping",
              body: "Clear product details, dependable checkout, and support when you need it.",
            },
            {
              icon: Truck,
              title: "Delivery options",
              body: "Delivery availability, timing, and cost are confirmed for each order at checkout.",
            },
            {
              icon: Heart,
              title: "Smart shopping, simply",
              body: "Useful products, quality services, and smart finds for modern life.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-lg border border-border bg-card p-6"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-lg font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative overflow-hidden border-t border-border bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-300 mb-3">
            Shop The Boyz Store
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl font-semibold tracking-tight max-w-3xl mx-auto leading-tight">
            Find your next useful product or service in one place.
          </h2>
          <p className="mt-5 text-background/75 max-w-xl mx-auto">
            {STORE_CONTACT.address} · {STORE_CONTACT.hours}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/contact">Talk to the team</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-transparent border-background/40 text-background hover:bg-background/10 hover:text-background"
            >
              <Link href="/shop">Shop online</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
