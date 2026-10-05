import type { Metadata } from "next";
import Link from "next/link";
import {
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
import { getSiteSettings } from "@/lib/site/store";

export const metadata: Metadata = {
  title: "Policies",
  description:
    "The Boyz Store returns, exchanges, authenticity, shipping, privacy, terms and payment policies. Clear, fair, and rooted in Ghanaian consumer protection.",
  alternates: { canonical: "/policies" },
  openGraph: {
    title: "Policies · The Boyz Store",
    description:
      "Returns, exchanges, authenticity, shipping, privacy, terms and payment.",
  },
};

const SECTIONS = [
  {
    id: "returns",
    icon: RotateCcw,
    title: "Returns & Exchanges",
    summary: "7-day return window · custom items are final sale",
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

export default async function PoliciesPage() {
  const settings = await getSiteSettings();
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
          <p className="text-xs uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-3">
            Clear &amp; fair
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight">
            Our{" "}
            <span className="bg-gradient-to-r from-teal-500 via-teal-600 to-teal-500 bg-clip-text text-transparent">
              policies.
            </span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl">
            We keep our policies short, plain, and fair. If anything here is
            unclear, message us on WhatsApp — we&apos;d rather talk it through
            than hide behind fine print.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            The Boyz Store is operated by {settings.legalBusinessName}.
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
                    <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
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
                    <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400">
                      <RotateCcw className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-serif text-lg font-semibold">
                        Returns &amp; Exchanges
                      </p>
                      <p className="text-xs text-muted-foreground font-normal">
                        7-day return window · custom items are final sale
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-3 leading-relaxed pb-6">
                  <p>
                    We want you to love every item. If for any reason you
                    don&apos;t, we accept returns within 7 days of delivery for
                    unworn, unaltered items in their original condition, and
                    returned in their The Boyz Store packaging.
                  </p>
                  <p>
                    To start a return, message us on WhatsApp with your order
                    reference. We&apos;ll send instructions and a return
                    address. Return shipping is the buyer&apos;s responsibility
                    except in the case of a defect or our error, in which case
                    we cover it in full.
                  </p>
                  <p>
                    Custom, engraved, or made-to-order items are final sale
                    and cannot be returned. Personalized or opened items may be non-returnable for
                    hygiene reasons unless faulty.
                  </p>
                  <p>
                    Exchanges follow the same 7-day window. If you&apos;d like
                    a different size or attribute, please return the original
                    item and place a new order — we&apos;ll do our best to
                    prioritise the new item.
                  </p>
                  <p>
                    Questions?{" "}
                    <a
                      href={SUPPORT_WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground underline underline-offset-4 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Chat with us on WhatsApp
                    </a>
                    .
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="authenticity" id="authenticity" className="border-b">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-start gap-4 pr-4">
                    <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-serif text-lg font-semibold">
                        Authenticity &amp; Warranty
                      </p>
                      <p className="text-xs text-muted-foreground font-normal">
                        Certificate of authenticity · lifetime craftsmanship
                        guarantee
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-3 leading-relaxed pb-6">
                  <p>
                    Every The Boyz Store listing is described clearly and handled with care
                    in our Ashaley Botwe marketplace in Madina, Ghana. Each item
                    ships with a certificate of authenticity documenting the
                    materials and craftsmanship.
                  </p>
                  <p>
                    We stand behind our craftsmanship with a lifetime guarantee
                    against manufacturing defects. If a item ever fails due to
                    a defect in materials or workmanship, return it to our
                    Ashaley Botwe marketplace and we&apos;ll repair it at no charge.
                  </p>
                  <p>
                    The lifetime guarantee does not cover normal wear and tear,
                    loss, theft, damage from misuse or improper care, or
                    modifications made by a third party.
                  </p>
                  <p>
                    To make a warranty claim, please contact us on WhatsApp
                    with your order reference and a description of the issue.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="shipping" id="shipping" className="border-b">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-start gap-4 pr-4">
                    <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-serif text-lg font-semibold">
                        Shipping Policy
                      </p>
                      <p className="text-xs text-muted-foreground font-normal">
                        Processing times, regions, insurance, signature
                        requirement
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-3 leading-relaxed pb-6">
                  <p>
                    We deliver to all 10 regions of Ghana. Greater Accra orders
                    ship in 1–3 business days; other regions in 2–8 business
                    days. Pickup is free at our Ashaley Botwe marketplace in Madina.
                  </p>
                  <p>
                    All shipments are insured and require a signature on
                    delivery. We will not leave packages unattended. If no one
                    is available to sign, our courier will contact you to
                    arrange redelivery.
                  </p>
                  <p>
                    Orders are processed within 1–2 business days. Custom and
                    made-to-order items may take longer — we&apos;ll keep you
                    posted by WhatsApp.
                  </p>
                  <p>
                    We currently deliver within Ghana only. For international
                    shipping enquiries, please{" "}
                    <a
                      href={SUPPORT_WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground underline underline-offset-4 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      contact us
                    </a>
                    .
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="privacy" id="privacy" className="border-b">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-start gap-4 pr-4">
                    <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400">
                      <Lock className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-serif text-lg font-semibold">
                        Privacy Policy
                      </p>
                      <p className="text-xs text-muted-foreground font-normal">
                        What we collect, how we use it, your rights
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-3 leading-relaxed pb-6">
                  <p>
                    We collect the information you provide at checkout and via
                    our contact form — name, email, phone, delivery address —
                    so we can fulfil your order and respond to your enquiries.
                  </p>
                  <p>
                    We do not sell or rent your personal information. We share
                    details only with the parties needed to fulfil your order
                    (courier, payment processor) and as required by law.
                  </p>
                  <p>
                    Payment is processed by Paystack. We never see or store your
                    card details — only the order reference and payment status
                    are recorded.
                  </p>
                  <p>
                    You may request access to, correction of, or deletion of
                    your personal information at any time by contacting us on
                    WhatsApp or by email at {STORE_CONTACT.email}.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="terms" id="terms" className="border-b">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-start gap-4 pr-4">
                    <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400">
                      <Scale className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-serif text-lg font-semibold">
                        Terms of Service
                      </p>
                      <p className="text-xs text-muted-foreground font-normal">
                        Pricing, product imagery, jurisdiction
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-3 leading-relaxed pb-6">
                  <p>
                    Prices are listed in Ghana cedis (GHS) and are subject to
                    change without notice. We reserve the right to refuse or
                    cancel any order at our discretion, in which case any
                    payment made will be refunded in full.
                  </p>
                  <p>
                    Product imagery is representative. Hand-finished items may
                    vary slightly from the photographs — this is a feature of
                    handcraft, not a defect.
                  </p>
                  <p>
                    These terms are governed by the laws of the Republic of
                    Ghana. Any disputes will be resolved in the courts of Ghana
                    unless we agree otherwise in writing.
                  </p>
                  <p>
                    By placing an order with The Boyz Store you
                    accept these terms in full.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="payment" id="payment">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-start gap-4 pr-4">
                    <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-serif text-lg font-semibold">
                        Payment
                      </p>
                      <p className="text-xs text-muted-foreground font-normal">
                        Paystack secure checkout · cards &amp; mobile money
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-3 leading-relaxed pb-6">
                  <p>
                    We accept payment via Paystack, which supports Visa,
                    Mastercard, Verve cards, mobile money (MTN MoMo,
                    Telecel Cash, AirtelTigo Money), and bank transfer.
                  </p>
                  <p>
                    At checkout you&apos;ll be redirected to Paystack&apos;s
                    secure page to complete payment. We never see or store your
                    card details. Paystack is PCI DSS compliant and uses 256-bit
                    encryption.
                  </p>
                  <p>
                    Final totals — including delivery and any price updates —
                    are recomputed on our server before payment is initiated.
                    The subtotal shown in your bag is for display only.
                  </p>
                  <p>
                    If a payment fails or is declined, no charge is made and
                    your bag is preserved so you can try again. If you believe
                    you&apos;ve been charged in error, please contact us with
                    your order reference.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight mb-3">
            Still have questions?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            We&apos;re happy to help. Chat with us on WhatsApp or send us an
            email.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <a
                href={SUPPORT_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Chat on WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={`mailto:${STORE_CONTACT.email}`}>Email us</a>
            </Button>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
