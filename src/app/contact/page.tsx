import type { Metadata } from "next";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  CalendarCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { PublicShell } from "@/components/public/shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContactForm } from "@/components/public/contact-form";
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
  title: "Contact Us",
  description:
    "Visit LA GLITZ at our Osu atelier in Accra, or message us about a piece, a custom commission, or delivery. WhatsApp, email, phone — we're here to help.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Us · LA GLITZ",
    description:
      "Visit our Osu atelier or message us about a piece, commission or delivery.",
  },
};

export default function ContactPage() {
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
              <BreadcrumbPage>Contact</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* ===== HERO ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-3xl">
          <Badge variant="secondary" className="mb-5">
            <Sparkles className="h-3 w-3 mr-1.5" />
            We'd love to help
          </Badge>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight">
            We'd love to <span className="text-gold-gradient">hear from you.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Whether you're considering a piece, planning a custom commission,
            or just have a question — message us. We reply to every enquiry,
            usually within one business day.
          </p>
        </div>
      </section>

      {/* ===== FORM + DETAILS ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <div className="grid gap-10 lg:gap-12 lg:grid-cols-[1.2fr_1fr]">
          {/* form */}
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight mb-2">
              Send us a message
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Fill in the form below and we'll get back to you by email.
            </p>
            <ContactForm />
          </div>

          {/* details + map */}
          <div className="space-y-6">
            {/* contact details */}
            <div className="rounded-lg border border-border bg-card p-6 sm:p-8 space-y-5">
              <div>
                <h3 className="font-serif text-xl font-semibold mb-1">
                  {STORE_CONTACT.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Hand-finished fine jewelry in the heart of Osu.
                </p>
              </div>

              <div className="space-y-4 text-sm">
                <a
                  href={SUPPORT_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 group"
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-soft text-foreground">
                    <MessageCircle className="h-4 w-4 text-gold" />
                  </span>
                  <span>
                    <span className="block text-xs uppercase tracking-wider text-muted-foreground">
                      WhatsApp
                    </span>
                    <span className="font-medium group-hover:text-gold transition-colors">
                      {STORE_CONTACT.whatsapp}
                    </span>
                  </span>
                </a>

                <a
                  href={`mailto:${STORE_CONTACT.email}`}
                  className="flex items-start gap-3 group"
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-soft text-foreground">
                    <Mail className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-xs uppercase tracking-wider text-muted-foreground">
                      Email
                    </span>
                    <span className="font-medium group-hover:text-gold transition-colors">
                      {STORE_CONTACT.email}
                    </span>
                  </span>
                </a>

                <a
                  href={`tel:${STORE_CONTACT.phone.replace(/\s/g, "")}`}
                  className="flex items-start gap-3 group"
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-soft text-foreground">
                    <Phone className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-xs uppercase tracking-wider text-muted-foreground">
                      Phone
                    </span>
                    <span className="font-medium group-hover:text-gold transition-colors">
                      {STORE_CONTACT.phone}
                    </span>
                  </span>
                </a>

                <div className="flex items-start gap-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-soft text-foreground">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-xs uppercase tracking-wider text-muted-foreground">
                      Atelier
                    </span>
                    <span className="font-medium">{STORE_CONTACT.address}</span>
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-soft text-foreground">
                    <Clock className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-xs uppercase tracking-wider text-muted-foreground">
                      Hours
                    </span>
                    <span className="font-medium">{STORE_CONTACT.hours}</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      Closed Sundays and Ghanaian public holidays
                    </span>
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <Button asChild className="flex-1">
                  <a
                    href={SUPPORT_WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    WhatsApp us
                  </a>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <a href={`mailto:${STORE_CONTACT.email}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </a>
                </Button>
              </div>
            </div>

            {/* private viewings note */}
            <div className="rounded-lg border border-gold/30 bg-gold-soft p-6">
              <div className="flex items-start gap-3">
                <CalendarCheck className="h-6 w-6 text-gold shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-serif text-lg font-semibold mb-1">
                    Book a private viewing
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Planning to see a specific piece, or shopping for an
                    engagement? Book a private, no-pressure viewing at the
                    atelier — we'll have the bench ready and a glass of
                    something cold waiting.
                  </p>
                  <Button
                    asChild
                    variant="link"
                    className="h-auto p-0 mt-3 text-foreground hover:text-gold"
                  >
                    <a
                      href={`${SUPPORT_WHATSAPP_URL}?text=${encodeURIComponent(
                        "Hello LA GLITZ — I'd like to book a private viewing."
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Book on WhatsApp
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            {/* map placeholder */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, hsl(var(--border) / 0.4) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border) / 0.4) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
                aria-hidden
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-background border border-border shadow-sm mb-3">
                  <MapPin className="h-6 w-6 text-gold" />
                </span>
                <p className="font-serif text-lg font-semibold">
                  {STORE_CONTACT.name}
                </p>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  {STORE_CONTACT.address}
                </p>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Oxford+Street+Osu+Accra+Ghana"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm text-foreground hover:text-gold transition-colors"
                >
                  Open in Google Maps
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
