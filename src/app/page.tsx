import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Truck,
  Gem,
  Quote,
  Heart,
} from "lucide-react";
import { PublicShell } from "@/components/public/shell";
import { ProductCard } from "@/components/public/product-card";
import { ReviewsWidget } from "@/components/public/reviews-widget";
import { BlogCard } from "@/components/public/blog-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getFeaturedProducts,
  getActiveCategories,
} from "@/lib/blogger/client";
import {
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
  type Category,
} from "@/lib/blogger/types";
import { getBlogPosts } from "@/lib/blog/client";
import { STORE_CONTACT } from "@/lib/ghana";

const CATEGORY_IMAGES: Record<Category, string> = {
  rings: "/categories/rings.jpg",
  earrings: "/categories/earrings.jpg",
  necklaces: "/categories/necklaces.jpg",
  bracelets: "/categories/bracelets.jpg",
  sets: "/categories/sets.jpg",
  "new-arrivals": "/categories/new-arrivals.jpg",
};

export const metadata = {
  title: "Afrocentric Jewelry by LaGlitz — Africa Arising",
  description:
    "Afrocentric jewelry by LaGlitz. Handcrafted rings, earrings, necklaces, bracelets and sets inspired by African heritage. Founded by Charity Kessewaa Frimpong in Ashaley Botwe, Madina, Ghana.",
};

export default async function HomePage() {
  const [featured, activeCats, posts] = await Promise.all([
    getFeaturedProducts(8),
    getActiveCategories(),
    getBlogPosts(3).catch(() => []),
  ]);

  // Always show all 6 categories on the home grid (even when 0 products)
  const allCategories: Category[] = [
    "rings",
    "earrings",
    "necklaces",
    "bracelets",
    "sets",
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
            src="/hero/hero-jewelry.jpg"
            alt="Afrocentric jewelry editorial — Africa Arising"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[88vh] max-h-[860px] flex-col justify-center py-24">
            <div className="max-w-2xl">
              <Badge
                variant="secondary"
                className="mb-5 bg-white/10 text-white border-white/20 backdrop-blur-sm"
              >
                <Sparkles className="h-3 w-3 mr-1.5" />
                Africa Arising · Handcrafted in Ghana
              </Badge>
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight text-white">
                Afrocentric jewelry,
                <br />
                <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-amber-200 bg-clip-text text-transparent">
                  Africa Arising.
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-white/85 leading-relaxed">
                Afrocentric Jewelry by LaGlitz is a premium Ghanaian jewelry
                house founded by{" "}
                <span className="text-white font-medium">
                  Charity Kessewaa Frimpong
                </span>
                . We craft rings, earrings, necklaces and bracelets inspired by
                the textures, symbols and spirit of Africa — finished by hand
                in Ashaley Botwe, Madina.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="text-base">
                  <Link href="/shop">
                    Shop the collection
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="text-base bg-white/5 border-white/30 text-white hover:bg-white/15 hover:text-white"
                >
                  <Link href="/shop?category=new-arrivals">New arrivals</Link>
                </Button>
              </div>

              {/* trust strip */}
              <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/80">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-teal-300" />
                  Authenticity guaranteed
                </span>
                <span className="inline-flex items-center gap-2">
                  <Truck className="h-4 w-4 text-teal-300" />
                  Delivery across Ghana
                </span>
                <span className="inline-flex items-center gap-2">
                  <Gem className="h-4 w-4 text-teal-300" />
                  Hand-finished in Accra
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="flex items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400 mb-2">
              Shop by category
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight">
              Find your piece
            </h2>
          </div>
          <Button asChild variant="ghost" className="hidden sm:inline-flex shrink-0">
            <Link href="/shop">
              View all
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
          {categoryRows.map(({ category, count }) => (
            <Link
              key={category}
              href={`/shop?category=${category}`}
              className="group relative overflow-hidden rounded-lg border border-border bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <Image
                  src={CATEGORY_IMAGES[category]}
                  alt={CATEGORY_LABELS[category]}
                  width={600}
                  height={600}
                  loading="lazy"
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-serif text-lg font-semibold text-white">
                  {CATEGORY_LABELS[category]}
                </h3>
                <p className="text-xs text-white/75 line-clamp-1">
                  {count > 0
                    ? `${count} ${count === 1 ? "piece" : "pieces"}`
                    : "Coming soon"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== FEATURED ===== */}
      {featured.length > 0 && (
        <section className="bg-muted/30 border-y border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="flex items-end justify-between mb-10 gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400 mb-2">
                  Curated by our atelier
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight">
                  Featured pieces
                </h2>
              </div>
              <Button asChild variant="ghost" className="hidden sm:inline-flex shrink-0">
                <Link href="/shop">
                  Shop all
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {featured.slice(0, 4).map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 4} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== BRAND STORY ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid gap-10 lg:gap-16 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border">
            <Image
              src="/founder.webp"
              alt="Charity Kessewaa Frimpong, founder of Afrocentric Jewelry by LaGlitz"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
              Our story
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
              Founded by Charity Kessewaa Frimpong.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Afrocentric Jewelry by LaGlitz was founded on a single belief:
              that African craft belongs in the same conversation as the
              world&apos;s finest jewelry. From our workshop in Ashaley Botwe,
              Madina, we handcraft every piece using techniques passed down
              through generations — drawing on the warmth of African gold,
              Adinkra symbolism, and the rhythm of Ghanaian celebration.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We don&apos;t make jewelry for occasions. We make jewelry that
              becomes the occasion.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild>
                <Link href="/about">
                  Read our story
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/contact">Visit the atelier</Link>
              </Button>
            </div>

            {/* quote */}
            <blockquote className="mt-6 border-l-2 border-teal-500 pl-4">
              <Quote className="h-5 w-5 text-teal-500 mb-2" />
              <p className="font-serif text-lg italic text-foreground/90">
                &ldquo;Africa Arising — and every piece we make carries that
                spirit.&rdquo;
              </p>
              <footer className="mt-2 text-sm text-muted-foreground">
                — Charity Kessewaa Frimpong, Founder
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
                <p className="text-xs uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400 mb-2">
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
              icon: Gem,
              title: "Hand-finished craft",
              body: "Every piece is hand-finished in our Ashaley Botwe atelier — never mass-produced.",
            },
            {
              icon: ShieldCheck,
              title: "Authenticity guaranteed",
              body: "Each piece ships with a certificate of authenticity and our craftsmanship guarantee.",
            },
            {
              icon: Truck,
              title: "Delivery across Ghana",
              body: "From Greater Accra to Tamale. Pickup available at our Ashaley Botwe atelier.",
            },
            {
              icon: Heart,
              title: "Africa Arising",
              body: "Inspired by Adinkra symbols, kente texture and the warmth of African gold.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-lg border border-border bg-card p-6"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400">
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
          <p className="text-xs uppercase tracking-[0.2em] text-teal-300 mb-3">
            Visit us in Ashaley Botwe
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl font-semibold tracking-tight max-w-3xl mx-auto leading-tight">
            See the collection in person at our Madina atelier.
          </h2>
          <p className="mt-5 text-background/75 max-w-xl mx-auto">
            {STORE_CONTACT.address} · {STORE_CONTACT.hours}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/contact">Book a private viewing</Link>
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
