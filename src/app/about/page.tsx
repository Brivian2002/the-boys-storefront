import Image from "next/image";
import Link from "next/link";
import {
  Gem,
  ShieldCheck,
  HandHeart,
  Sparkles,
  ArrowRight,
  Leaf,
} from "lucide-react";
import { PublicShell } from "@/components/public/shell";
import { Button } from "@/components/ui/button";
import { STORE_CONTACT } from "@/lib/ghana";

export const metadata = {
  title: "About — Afrocentric Jewelry by LaGlitz",
  description:
    "Afrocentric Jewelry by LaGlitz was founded by Charity Kessewaa Frimpong in Ashaley Botwe, Madina, Ghana. Our story, our values, and the Adinkra symbols that inspire our craft.",
};

const VALUES = [
  {
    icon: Gem,
    title: "Hand-finished craft",
    body: "Every piece is hand-finished in our Ashaley Botwe atelier. We don't mass-produce — we shape, set, and polish each piece by hand.",
  },
  {
    icon: ShieldCheck,
    title: "Authenticity guaranteed",
    body: "Each piece ships with a certificate of authenticity. We stand behind our craftsmanship with a lifetime guarantee on every order.",
  },
  {
    icon: HandHeart,
    title: "Rooted in heritage",
    body: "We draw on Adinkra symbols, kente texture and the warmth of African gold — without relying on cliché. Africa Arising, in every detail.",
  },
  {
    icon: Sparkles,
    title: "Made to be worn",
    body: "Designed for daily life, not just the showcase. Built to be lived in, loved, and passed on to the next generation.",
  },
];

const ADINKRA = [
  {
    src: "/adinkra/gye-nyame.png",
    name: "Gye Nyame",
    meaning: "Supremacy of God",
    body: "A reminder of the omnipotence of the Creator — the most widely used Adinkra symbol, present in our brand spirit of Africa Arising.",
  },
  {
    src: "/adinkra/dwennimmen.png",
    name: "Dwennimmen",
    meaning: "Humility & strength",
    body: "Ram's horns. The balance of power with humility — qualities we hold ourselves to in craft and in service.",
  },
  {
    src: "/adinkra/nyame-dua-alt.png",
    name: "Nyame Dua",
    meaning: "God's presence",
    body: "A sacred altar. A symbol of God's presence in our work and our relationships with every customer.",
  },
  {
    src: "/adinkra/eban.png",
    name: "Eban",
    meaning: "Protection & safety",
    body: "A fence. Our promise to protect the trust you place in us — your pieces, your data, your celebrations.",
  },
];

export default function AboutPage() {
  return (
    <PublicShell>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0">
          <Image
            src="/about-hero.jpg"
            alt="Charity Kessewaa Frimpong, founder of Afrocentric Jewelry by LaGlitz"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[70vh] max-h-[720px] flex-col justify-center py-20">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.2em] text-teal-300 mb-3">
                Our story
              </p>
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight text-white">
                Crafted in
                <br />
                <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-amber-200 bg-clip-text text-transparent">
                  Ashaley Botwe.
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-white/85 leading-relaxed">
                Afrocentric Jewelry by LaGlitz is a premium Ghanaian jewelry
                house handcrafting pieces inspired by the textures, symbols and
                spirit of Africa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STORY ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid gap-10 lg:gap-16 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border">
            <Image
              src="/our-story.webp"
              alt="Charity Kessewaa Frimpong, founder"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
              Founded by Charity Kessewaa Frimpong
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
              From Ashaley Botwe to your jewelry box.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Afrocentric Jewelry by LaGlitz was founded on a simple belief:
              that Ghanaian craft belongs in the same conversation as the
              world&apos;s finest jewelry houses. Every piece is designed and
              hand-finished in our atelier in Ashaley Botwe, Madina — drawing on
              the warmth of African gold, the texture of kente, and the
              centuries-old language of Adinkra symbols.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The result is jewelry that feels both contemporary and rooted.
              Pieces designed to be worn for a lifetime — and passed on to the
              next. Africa Arising.
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
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400 mb-2">
              What we stand for
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight">
              Our values
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-lg border border-border bg-card p-6"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400">
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

      {/* ===== ADINKRA ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400 mb-2">
            Symbols that guide us
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight">
            Adinkra symbolism
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            The Adinkra symbols of the Akan people of Ghana carry proverbs,
            wisdom and values. We carry four of them into our craft.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ADINKRA.map(({ src, name, meaning, body }) => (
            <div
              key={name}
              className="rounded-lg border border-border bg-card p-6 text-center"
            >
              <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-teal-500/5 border border-teal-500/20">
                {/* Plain img tag — Adinkra symbols are static decorative SVGs */}
                <img
                  src={src}
                  alt={`${name} Adinkra symbol`}
                  width={96}
                  height={96}
                  loading="lazy"
                />
              </div>
              <p className="text-xs uppercase tracking-[0.18em] text-teal-600 dark:text-teal-400 mb-1">
                {meaning}
              </p>
              <h3 className="font-serif text-xl font-semibold mb-2">{name}</h3>
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
          <Leaf className="mx-auto h-8 w-8 text-teal-300 mb-4" />
          <h2 className="font-serif text-3xl sm:text-5xl font-semibold tracking-tight max-w-3xl mx-auto leading-tight">
            Africa Arising — wear it with pride.
          </h2>
          <p className="mt-5 text-background/75 max-w-xl mx-auto">
            {STORE_CONTACT.address} · {STORE_CONTACT.hours}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/shop">Shop the collection</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-transparent border-background/40 text-background hover:bg-background/10 hover:text-background"
            >
              <Link href="/contact">Visit the atelier</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
