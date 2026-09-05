import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Truck,
  Lock,
  Scale,
  CreditCard,
  MessageCircle,
} from "lucide-react";
import { PublicShell } from "@/components/public/shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { STORE_CONTACT, SUPPORT_WHATSAPP_URL } from "@/lib/ghana";

export const metadata: Metadata = {
  title: "Policies",
  description:
    "LA GLITZ returns, exchanges, authenticity, shipping, privacy, terms and payment policies. Clear, fair, and rooted in Ghanaian consumer protection.",
  alternates: { canonical: "/policies" },
  openGraph: {
    title: "Policies · LA GLITZ",
    description:
      "Returns, exchanges, authenticity, shipping, privacy, terms and payment.",
  },
};

const SECTIONS = [
  {
    id: "returns",
    icon: RotateCcw,
    title: "Returns & Exchanges",
    summary: "7-day return window · custom pieces are final sale",
  },
  {
    id: "authenticity",
    icon: ShieldCheck,
    title: "Authenticity & Warranty",
    summary: "Certificate of authenticity · lifetime craftsmanship guarantee",
  },
  {
    id: "shipping",
    icon: Truck,
    title: "Shipping Policy",
    summary: "Processing times, regions, insurance, signature requirement",
  },
  {
    id: "privacy",
    icon: Lock,
    title: "Privacy Policy",
    summary: "What we collect, how we use it, your rights",
  },
  {
    id: "terms",
    icon: Scale,
    title: "Terms of Service",
    summary: "Pricing, product imagery, jurisdiction",
  },
  {
    id: "payment",
    icon: CreditCard,
    title: "Payment",
    summary: "Paystack secure checkout · cards & mobile money",
  },
] as const;

export default function PoliciesPage() {
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
              <BreadcrumbPage>Policies</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* ===== HERO ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-3xl">
          <Badge variant="secondary" className="mb-5">
            <Scale className="h-3 w-3 mr-1.5" />
            Clear & fair
          </Badge>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight">
            Our <span className="text-gold-gradient">policies.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl">
            We keep our policies short, plain, and fair. If anything here is
            unclear, message us on WhatsApp — we'd rather talk it through than
            hide behind fine print.
          </p>
        </div>
      </section>

      {/* ===== POLICY SECTIONS ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <div className="grid gap-10 lg:grid-cols-[280px_1fr] lg:gap-12">
          {/* sidebar nav */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
              Sections
            </p>
            <ul className="space-y-1">
              {SECTIONS.map(({ id, icon: Icon, title }) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Icon className="h-4 w-4 text-gold" />
                    {title}
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          {/* accordion content */}
          <div className="rounded-lg border border-border bg-card">
            <Accordion type="single" collapsible defaultValue="returns" className="px-5 sm:px-6">
              <AccordionItem value="returns" id="returns" className="border-b">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-start gap-4 pr-4">
                    <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-soft text-foreground">
                      <RotateCcw className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-serif text-lg font-semibold text-foreground">
                        Returns & Exchanges
                      </p>
                      <p className="text-xs text-muted-foreground font-normal mt-0.5">
                        7-day return window · custom pieces are final sale
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed space-y-3 pl-14">
                  <p>
                    We accept returns within <strong className="text-foreground">7 days of delivery</strong>{" "}
                    on ready-made pieces, provided the jewelry is unworn, in its
                    original condition, and returned in its LA GLITZ packaging
                    with the certificate of authenticity intact. Pieces that
                    show signs of wear, resizing, or alteration cannot be
                    accepted.
                  </p>
                  <p>
                    <strong className="text-foreground">Custom and commissioned pieces are final sale.</strong>{" "}
                    Because they are made to your specifications, we cannot
                    resell them — please confirm all details (size, metal,
                    gemstone) before approving the design.
                  </p>
                  <p>
                    To initiate a return, contact us at{" "}
                    <a
                      href={`mailto:${STORE_CONTACT.email}`}
                      className="text-foreground underline underline-offset-4 hover:text-gold"
                    >
                      {STORE_CONTACT.email}
                    </a>{" "}
                    or message us on{" "}
                    <a
                      href={SUPPORT_WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground underline underline-offset-4 hover:text-gold"
                    >
                      WhatsApp
                    </a>{" "}
                    with your order number. We'll send return instructions and
                    a confirmation. Return shipping is the buyer's
                    responsibility unless the piece arrived damaged or
                    incorrect.
                  </p>
                  <p>
                    Approved refunds are processed back to your original payment
                    method within <strong className="text-foreground">5–10 business days</strong>,
                    depending on your bank. Exchanges for store credit are
                    processed immediately on receipt of the returned piece.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="authenticity" id="authenticity" className="border-b">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-start gap-4 pr-4">
                    <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-soft text-foreground">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-serif text-lg font-semibold text-foreground">
                        Authenticity & Warranty
                      </p>
                      <p className="text-xs text-muted-foreground font-normal mt-0.5">
                        Certificate of authenticity · lifetime craftsmanship guarantee
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed space-y-3 pl-14">
                  <p>
                    Every piece ships with a{" "}
                    <strong className="text-foreground">certificate of authenticity</strong>{" "}
                    signed by our atelier, listing the metal (karat and weight),
                    gemstone specifications (type, cut, carat, clarity where
                    graded), and a unique serial number matched to the
                    hallmark on the piece.
                  </p>
                  <p>
                    We guarantee every piece as{" "}
                    <strong className="text-foreground">solid 18k or 22k gold</strong> — never
                    plated, never filled. Gemstones are disclosed as natural or
                    lab-grown, with any treatments noted on the certificate.
                  </p>
                  <p>
                    Each piece carries a{" "}
                    <strong className="text-foreground">lifetime craftsmanship guarantee</strong>{" "}
                    against manufacturing defects — covering prong re-tipping,
                    solder joints, clasps and settings. Bring or send the piece
                    to our Osu atelier and we'll repair it at no charge.
                  </p>
                  <p>
                    The guarantee does <strong className="text-foreground">not cover</strong> normal
                    wear and tear, loss, theft, damage from misuse or impact,
                    resizing by a third party, or damage from harsh chemicals
                    (including chlorine and certain cosmetics). Regular wear
                    cleaning and inspection are complimentary for life.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="shipping" id="shipping" className="border-b">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-start gap-4 pr-4">
                    <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-soft text-foreground">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-serif text-lg font-semibold text-foreground">
                        Shipping Policy
                      </p>
                      <p className="text-xs text-muted-foreground font-normal mt-0.5">
                        Processing times, regions, insurance, signature requirement
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed space-y-3 pl-14">
                  <p>
                    We ship to all{" "}
                    <strong className="text-foreground">16 regions of Ghana</strong>. In-stock
                    pieces are processed within 1–3 business days; made-to-order
                    and commissioned pieces take 2–4 weeks and we confirm timing
                    at order. See our{" "}
                    <Link
                      href="/delivery"
                      className="text-foreground underline underline-offset-4 hover:text-gold"
                    >
                      delivery & pickup page
                    </Link>{" "}
                    for the full regional fee schedule.
                  </p>
                  <p>
                    Every shipment is{" "}
                    <strong className="text-foreground">fully insured</strong> for its declared
                    value and requires a{" "}
                    <strong className="text-foreground">signature on delivery</strong>. Please
                    have a valid ID available for the courier. If you're not
                    available, the courier will attempt redelivery or hold the
                    package at a local depot.
                  </p>
                  <p>
                    Delivery fees are charged by region and shown before payment. Every order is carefully packaged; pickup at our Osu atelier or Kumasi partner location can be arranged separately.
                  </p>
                  <p>
                    We currently ship within Ghana only. For international
                    delivery, contact us on WhatsApp for a courier quote.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="privacy" id="privacy" className="border-b">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-start gap-4 pr-4">
                    <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-soft text-foreground">
                      <Lock className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-serif text-lg font-semibold text-foreground">
                        Privacy Policy
                      </p>
                      <p className="text-xs text-muted-foreground font-normal mt-0.5">
                        What we collect, how we use it, your rights
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed space-y-3 pl-14">
                  <p>
                    We collect only what we need to fulfill your order and
                    provide support:{" "}
                    <strong className="text-foreground">your name, contact details, delivery address, and order history</strong>.
                    We do not store card details — payments are processed
                    securely by{" "}
                    <strong className="text-foreground">Paystack</strong>, and we only receive a
                    confirmation of successful payment.
                  </p>
                  <p>
                    We use your information to process and ship your order,
                    respond to enquiries, send order updates, and (only if you
                    opt in) occasional updates about new collections. We do not
                    sell or rent your data to third parties.
                  </p>
                  <p>
                    We use basic cookies and local storage to keep your
                    shopping bag between visits, remember your theme
                    preference, and measure aggregate traffic. We do not use
                    advertising trackers.
                  </p>
                  <p>
                    You can request access to, correction of, or deletion of
                    your personal data at any time by emailing{" "}
                    <a
                      href={`mailto:${STORE_CONTACT.email}`}
                      className="text-foreground underline underline-offset-4 hover:text-gold"
                    >
                      {STORE_CONTACT.email}
                    </a>
                    . We'll respond within 30 days.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="terms" id="terms" className="border-b">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-start gap-4 pr-4">
                    <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-soft text-foreground">
                      <Scale className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-serif text-lg font-semibold text-foreground">
                        Terms of Service
                      </p>
                      <p className="text-xs text-muted-foreground font-normal mt-0.5">
                        Pricing, product imagery, jurisdiction
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed space-y-3 pl-14">
                  <p>
                    All prices are listed in{" "}
                    <strong className="text-foreground">Ghana cedis (GHS)</strong> and include
                    applicable taxes. We reserve the right to update prices,
                    availability, and product specifications at any time
                    without notice. The price confirmed at checkout is the
                    price you pay.
                  </p>
                  <p>
                    Product images are photographed in our atelier under
                    controlled lighting. Because each piece is hand-finished,
                    <strong className="text-foreground"> minor variations may occur</strong> —
                    particularly in pieces with natural gemstones, where
                    inclusions and color are part of the stone's character.
                    Metal weights and gemstone carat weights may vary slightly
                    from the listed values.
                  </p>
                  <p>
                    Placing an order constitutes an offer to purchase. The
                    contract is formed when we dispatch the order and send
                    shipping confirmation. We may decline or cancel an order
                    in cases of pricing error, suspected fraud, or
                    unavailable stock — in which case any payment is refunded
                    in full.
                  </p>
                  <p>
                    These terms are governed by the laws of the{" "}
                    <strong className="text-foreground">Republic of Ghana</strong>. Any disputes
                    will be resolved in the courts of Ghana, unless we agree
                    otherwise in writing.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="payment" id="payment">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-start gap-4 pr-4">
                    <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-soft text-foreground">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-serif text-lg font-semibold text-foreground">
                        Payment
                      </p>
                      <p className="text-xs text-muted-foreground font-normal mt-0.5">
                        Paystack secure checkout · cards & mobile money
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed space-y-3 pl-14">
                  <p>
                    Checkout is powered by{" "}
                    <strong className="text-foreground">Paystack</strong>, a PCI-DSS compliant
                    payment processor. Your card details are encrypted and sent
                    directly to Paystack — they never touch our servers.
                  </p>
                  <p>
                    We accept{" "}
                    <strong className="text-foreground">Visa, Mastercard and Verve</strong> cards
                    issued by any bank, as well as mobile money (MTN MoMo,
                    Telecel Cash and AirtelTigo Money). All transactions are in
                    GHS.
                  </p>
                  <p>
                    If a payment fails, no charge is made. If you see a
                    duplicate or unauthorized charge, contact us immediately
                    with the order reference and we'll coordinate a refund
                    through Paystack.
                  </p>
                  <p>
                    For commissioned pieces, we may request a deposit at order
                    and the balance before dispatch. The exact schedule is
                    confirmed in your commission agreement.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* ===== CONTACT CTA ===== */}
      <section className="relative overflow-hidden border-t border-border bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight max-w-2xl mx-auto leading-tight">
            Still have a question?
          </h2>
          <p className="mt-4 text-background/75 max-w-xl mx-auto">
            Our team is happy to walk you through any policy before you buy.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" variant="secondary">
              <a
                href={SUPPORT_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Chat on WhatsApp
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-transparent border-background/40 text-background hover:bg-background/10 hover:text-background"
            >
              <Link href="/contact">
                Contact us
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
