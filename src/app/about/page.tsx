import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, HeartHandshake, Search, Truck } from "lucide-react";
import { PublicShell } from "@/components/public/shell";
import { Button } from "@/components/ui/button";
import { STORE_CONTACT } from "@/lib/ghana";

export const metadata = {
  title: "About — The Boyz Store",
  description:
    "Meet Joshua Nasi Words, founder of The Boyz Store, a modern marketplace for products, services, and everyday finds.",
};

const VALUES = [
  {
    icon: Search,
    title: "Clear discovery",
    body: "We make it easier to browse useful categories, compare options, and find the right fit without the noise.",
  },
  {
    icon: BadgeCheck,
    title: "Trusted listings",
    body: "Product and service details are presented clearly so you can shop with better context and confidence.",
  },
  {
    icon: Truck,
    title: "Built for delivery",
    body: "The marketplace is designed around practical fulfillment, responsive support, and a smoother post-purchase experience.",
  },
  {
    icon: HeartHandshake,
    title: "People first",
    body: "The Boyz Store is growing around real everyday needs: useful products, helpful services, and dependable relationships.",
  },
];

export default function AboutPage() {
  return (
    <PublicShell>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0">
          <Image
            src="/hero/marketplace-story.jpg"
            alt="The Boyz Store product curation workspace"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-slate-950/10" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs uppercase tracking-[0.22em] text-blue-200">The idea behind the store</p>
            <h1 className="font-serif text-5xl font-semibold leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-7xl">
              A better place to find what everyday life needs.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
              The Boyz Store is a professional online marketplace founded by Joshua Nasi Words—bringing products, services, and smart finds together in one focused experience.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20 lg:px-8">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
          <Image src="/hero/marketplace-hero.jpg" alt="The Boyz Store marketplace campaign" fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
        </div>
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.22em] text-blue-600">Founded by Joshua Nasi Words</p>
          <h2 className="font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Commerce should feel useful, not overwhelming.</h2>
          <p className="leading-relaxed text-muted-foreground">
            Joshua Nasi Words created The Boyz Store to make online shopping feel more intentional: fewer distractions, better categories, useful details, and a clear path from discovery to delivery.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            The store is built to grow—from electronics and fashion to home, gadgets, sports, bundles, and services—while keeping the experience simple enough for an everyday shopper.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild><Link href="/shop">Explore the marketplace <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            <Button asChild variant="outline"><Link href="/contact">Talk to the team</Link></Button>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <p className="mb-2 text-xs uppercase tracking-[0.22em] text-blue-600">How we build</p>
            <h2 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">Professional by design. Human at heart.</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600"><Icon className="h-5 w-5" /></div>
                <h3 className="mb-2 font-serif text-xl font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-foreground text-background">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
          <p className="mb-3 text-xs uppercase tracking-[0.22em] text-blue-200">Shop the difference</p>
          <h2 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">Find something useful. Find something you did not know you needed.</h2>
          <p className="mx-auto mt-5 max-w-xl text-background/70">{STORE_CONTACT.address} · {STORE_CONTACT.hours}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Button asChild size="lg" variant="secondary"><Link href="/shop">Start browsing</Link></Button><Button asChild size="lg" variant="outline" className="border-background/40 bg-transparent text-background hover:bg-background/10 hover:text-background"><Link href="/contact">Contact the team</Link></Button></div>
        </div>
      </section>
    </PublicShell>
  );
}
