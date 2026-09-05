import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Truck,
  Gem,
  Quote,
} from "lucide-react";
import { PublicShell } from "@/components/public/shell";
import { ProductCard } from "@/components/public/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getFeaturedProducts,
  getNewArrivals,
  getActiveCategories,
} from "@/lib/blogger/client";
import {
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
  type Category,
} from "@/lib/blogger/types";
import { STORE_CONTACT } from "@/lib/ghana";

const CATEGORY_IMAGES: Record<Category, string> = {
  rings: "/products/ring-adwoa-1.jpg",
  earrings: "/products/earrings-yaa-1.jpg",
  necklaces: "/products/chain-nkosi-1.jpg",
  bracelets: "/products/bangles-afia-1.jpg",
  sets: "/products/set-osabrini-1.jpg",
  "new-arrivals": "/products/earrings-efua-1.jpg",
};

export default async function HomePage() {
  const [featured, newArrivals, activeCats] = await Promise.all([
    getFeaturedProducts(8),
    getNewArrivals(8),
    getActiveCategories(),
  ]);

  return (
    <PublicShell>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/hero/hero-jewelry.jpg"
            alt="LA GLITZ fine jewelry editorial"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" />
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
                Handcrafted in Accra, Ghana
              </Badge>
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight text-white">
                Fine jewelry,
                <br />
                <span className="text-gold-gradient">made in Ghana.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-white/85 leading-relaxed">
                LA GLITZ is a premium Ghanaian jewelry house. We craft rings,
                earrings, necklaces and bracelets in solid gold and natural
                gemstones - finished by hand in our Osu atelier.
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
                  <ShieldCheck className="h-4 w-4 text-gold" />
                  Authentic solid gold
                </span>
                <span className="inline-flex items-center gap-2">
                  <Truck className="h-4 w-4 text-gold" />
                  Delivery across Ghana
                </span>
                <span className="inline-flex items-center gap-2">
                  <Gem className="h-4 w-4 text-gold" />
                  Natural & lab gemstones
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== DEPARTMENTS ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Shop by department
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight">
              Find your piece
            </h2>
          </div>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/shop">
              View all
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {activeCats.slice(0, 5).map(({ category, count }, idx) => (
            <Link
              key={category}
              href={`/shop?category=${category}`}
              className={`group relative overflow-hidden rounded-lg border border-border bg-card ${
                idx === 0 ? "col-span-2 md:col-span-1" : ""
              }`}
            >
              <div className="aspect-[4/5] overflow-hidden">
                <Image
                  src={CATEGORY_IMAGES[category]}
                  alt={CATEGORY_LABELS[category]}
                  width={400}
                  height={500}
                  sizes="(max-width: 768px) 50vw, 20vw"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-serif text-lg font-semibold text-white">
                  {CATEGORY_LABELS[category]}
                </h3>
                <p className="text-xs text-white/75">
                  {count} {count === 1 ? "piece" : "pieces"}
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
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  Curated by our atelier
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight">
                  Featured pieces
                </h2>
              </div>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
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
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <Image
              src="/hero/hero-atelier.jpg"
              alt="LA GLITZ atelier in Accra"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Our story
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
              From the bench in Osu to your jewelry box.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              LA GLITZ was founded on a simple belief: that Ghanaian craft
              belongs in the same conversation as the world's finest jewelry
              houses. Every piece is designed and hand-finished in our Accra
              atelier, using solid gold and ethically-sourced gemstones.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We draw on the texture of kente, the warmth of 22k gold, and the
              rhythm of Ghanaian celebration - without relying on cliché. The
              result is jewelry that feels both contemporary and rooted.
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
            <blockquote className="mt-6 border-l-2 border-gold pl-4">
              <Quote className="h-5 w-5 text-gold mb-2" />
              <p className="font-serif text-lg italic text-foreground/90">
                "We don't make jewelry for occasions. We make jewelry that
                becomes the occasion."
              </p>
              <footer className="mt-2 text-sm text-muted-foreground">
                — Founder, LA GLITZ
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* ===== NEW ARRIVALS ===== */}
      {newArrivals.length > 0 && (
        <section className="bg-muted/30 border-y border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  Fresh from the bench
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight">
                  New arrivals
                </h2>
              </div>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/shop?sort=newest">
                  View all
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {newArrivals.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
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
              title: "Solid gold, honestly priced",
              body: "Every piece is solid 18k or 22k gold - never plated. Prices reflect the metal and craft, fairly.",
            },
            {
              icon: ShieldCheck,
              title: "Authenticity guaranteed",
              body: "Each piece ships with a certificate of authenticity and our lifetime craftsmanship guarantee.",
            },
            {
              icon: Truck,
              title: "Delivery across Ghana",
              body: "From Accra to Tamale, every order is carefully packaged, insured, tracked, and delivered with the regional fee shown before payment.",
            },
            {
              icon: Sparkles,
              title: "Made to be worn",
              body: "Designed for daily life, not just the showcase. Built to be lived in and passed on.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-lg border border-border bg-card p-6"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-gold-soft text-foreground">
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
          <p className="text-xs uppercase tracking-[0.2em] text-background/60 mb-3">
            Visit us in Osu
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl font-semibold tracking-tight max-w-3xl mx-auto leading-tight">
            See the collection in person at our Accra atelier.
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
