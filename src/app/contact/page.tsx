import { MapPin, Phone, Clock, Mail, MessageCircle } from "lucide-react";
import { PublicShell } from "@/components/public/shell";
import { ContactForm } from "@/components/public/contact-form";
import { STORE_CONTACT, SUPPORT_WHATSAPP_URL } from "@/lib/ghana";

export const metadata = {
  title: "Contact — The Boys Store",
  description:
    "Get in touch with The Boys Store. Visit us in Ashaley Botwe, Madina, Ghana or send us a message.",
};

export default function ContactPage() {
  const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(
    "The Boys Store, Madina, Ghana"
  )}&output=embed`;

  return (
    <PublicShell>
      {/* ===== HERO ===== */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-3">
            We&apos;d love to hear from you
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight">
            Get in touch.
          </h1>
          <p className="mt-5 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Whether you&apos;re booking a private viewing, asking about a item,
            or commissioning something bespoke — we&apos;re here.
          </p>
        </div>
      </section>

      {/* ===== CONTACT GRID ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid gap-10 lg:gap-16 lg:grid-cols-2">
          {/* Form */}
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold mb-2">
              Send a message
            </h2>
            <p className="text-muted-foreground mb-6">
              Fill out the form and we&apos;ll get back to you within working
              hours.
            </p>
            <ContactForm />
          </div>

          {/* Contact details + map */}
          <div className="space-y-8">
            <div className="space-y-3">
              <h3 className="font-serif text-lg font-semibold">Contact details</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <span className="pt-1.5 text-muted-foreground">
                    {STORE_CONTACT.address}
                  </span>
                </li>
                <li>
                  <a
                    href={`tel:${STORE_CONTACT.phone.replace(/\s/g, "")}`}
                    className="flex items-start gap-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400">
                      <Phone className="h-4 w-4" />
                    </span>
                    <span className="pt-1.5">{STORE_CONTACT.phone}</span>
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400">
                    <Clock className="h-4 w-4" />
                  </span>
                  <span className="pt-1.5 text-muted-foreground">
                    {STORE_CONTACT.hours}
                  </span>
                </li>
                <li>
                  <a
                    href={SUPPORT_WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <MessageCircle className="h-4 w-4" />
                    </span>
                    <span className="pt-1.5">Chat on WhatsApp</span>
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${STORE_CONTACT.email}`}
                    className="flex items-start gap-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400">
                      <Mail className="h-4 w-4" />
                    </span>
                    <span className="pt-1.5">{STORE_CONTACT.email}</span>
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-serif text-lg font-semibold mb-3">
                Find us
              </h3>
              <div className="overflow-hidden rounded-lg border border-border aspect-[4/3]">
                <iframe
                  title="Map to The Boys Store, Madina, Ghana"
                  src={mapsEmbed}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <a
                href="https://maps.app.goo.gl/p11ofPy6yyPUzDse7"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                <MapPin className="h-4 w-4" />
                Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
