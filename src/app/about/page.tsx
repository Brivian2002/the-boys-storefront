import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Gem,
  ShieldCheck,
  HandHeart,
  Sparkles,
  PenTool,
  Hammer,
  Diamond,
  HeartHandshake,
} from "lucide-react";
import { PublicShell } from "@/components/public/shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { STORE_CONTACT } from "@/lib/ghana";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "LA GLITZ is a premium Ghanaian jewelry house. Discover our Accra atelier, our commitment to solid gold and ethical gemstones, and the craft behind every piece.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Our Story · LA GLITZ",
    description:
      "A premium Ghanaian jewelry house crafting fine jewelry in our Accra atelier.",
    type: "article",
  },
};

const VALUES = [
  {
    icon: Gem,
    title: "Solid gold, honestly priced",
    body: "Every piece is solid 18k or 22k gold — never plated, never filled. We price transparently against the metal and the craft, with no inflated markups.",
  },
  {
    icon: ShieldCheck,
    title: "Ethical gemstones",
    body: "We source natural and lab-grown stones through traceable channels. Diamonds, sapphires and emeralds come with documentation of origin and treatment.",
  },
  {
    icon: HandHeart,
    title: "Hand-finished craft",
    body: "From the first sketch to the final polish, each piece passes through the hands of our Osu goldsmiths. Machine casting assists; the hand decides.",
  },
  {
    icon: Sparkles,
    title: "Lifetime craftsmanship guarantee",
    body: "We stand behind every piece we make. Manufacturing defects are covered for life — bring it home to Accra and we will make it right.",
  },
];

const PROCESS = [
  {
    icon: PenTool,
    step: "01",
    title: "Design",
    body: "Each piece begins as a sketch in our Osu studio — drawn by hand, refined against the body, and translated into a technical model.",
  },
  {
    icon: Hammer,
    step: "02",
    title: "Cast",
    body: "We hand-carve waxes and cast in solid 18k or 22k gold. Every casting is weighed, inspected, and stress-tested before it moves to the bench.",
  },
  {
    icon: Diamond,
    step: "03",
    title: "Set",
    body: "Gemstones are set by our master setter under magnification — each prong hand-fitted, each stone checked for cut, clarity and security.",
  },
  {
    icon: HeartHandshake,
    step: "04",
    title: "Finish",
    body: "The final polish, hallmark and certificate of authenticity complete the piece. What leaves the atelier is meant to be worn for a lifetime.",
  },
];

export default function AboutPage() {
  return (
    <PublicShell>
      {/* ===== BREADCRUMB ===== */}
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
              <BreadcrumbPage>About</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/hero/about-atelier.jpg"
            alt="Inside the LA GLITZ atelier in Osu, Accra"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[70vh] max-h-[760px] flex-col justify-center py-24">
            <div className="max-w-2xl">
              <Badge
                variant="secondary"
                className="mb-5 bg-white/10 text-white border-white/20 backdrop-blur-sm"
              >
                <Sparkles className="h-3 w-3 mr-1.5" />
                Est. in Accra, Ghana
              </Badge>
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight text-white">
                Crafted in Accra.
                <br />
                <span className="text-gold-gradient">Worn everywhere.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-white/85 leading-relaxed">
                LA GLITZ is a premium Ghanaian jewelry house. We design and
                hand-finish every piece in our Osu atelier — solid gold,
                ethically sourced gemstones, and a craft heritage rooted in the
                rhythm of Ghanaian celebration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STORY ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid gap-10 lg:gap-16 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg order-2 lg:order-1">
            <Image
              src="/hero/hero-atelier.jpg"
              alt="A goldsmith at work in the LA GLITZ atelier"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="space-y-5 order-1 lg:order-2">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Our story
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
              A jewelry house built on Ghanaian craft.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              LA GLITZ began in a small workshop off Oxford Street in Osu, with
              a single bench and a simple conviction: that Ghanaian goldsmiths
              deserve to be mentioned in the same breath as the great jewelry
              houses of Europe and Asia. We started with wedding bands for
              friends, then engagement rings, then full bridal sets — each one
              made the slow, deliberate way.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Today, our atelier brings together a small team of designers,
              casters, setters and polishers — most of them trained in Accra,
              some in family workshops going back three generations. We work in
              solid 18k and 22k gold, set natural and lab-grown gemstones with
              full documentation, and finish every piece by hand. Nothing leaves
              the bench without a hallmark and a certificate of authenticity.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We draw quietly on Ghana — the architecture of kente, the weight
              of a real Adinkra symbol, the warmth of high-karat gold at a
              Ghanaian wedding — without leaning on cliché. The result is
              jewelry that feels both contemporary and rooted, made to be worn
              for a lifetime and passed on.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild>
                <Link href="/shop">
                  Shop the collection
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/contact">Visit the atelier</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== VALUES ===== */}
      <section className="bg-muted/30 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-2xl mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
              What we stand for
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
              Four commitments behind every piece.
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-lg border border-border bg-card p-6"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-gold-soft text-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-lg font-semibold mb-2">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PROCESS ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-2xl mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
            From the bench
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
            How a piece is made.
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Every LA GLITZ piece moves through four stages at our Osu atelier —
            most of them by hand, none of them rushed.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS.map(({ icon: Icon, step, title, body }, i) => (
            <div key={title} className="relative">
              <div className="rounded-lg border border-border bg-card p-6 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gold-soft text-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-serif text-2xl font-semibold text-muted-foreground/40">
                    {step}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-semibold mb-2">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {body}
                </p>
              </div>
              {i < PROCESS.length - 1 && (
                <ArrowRight
                  className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 h-5 w-5 text-muted-foreground/40"
                  aria-hidden
                />
              )}
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
            See the bench. Hold the gold. Talk to the maker.
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
              <Link href="/shop">
                Shop the collection
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
