import Image from "next/image";
import Link from "next/link";
import {
  Truck,
  Package,
  MapPin,
  Clock,
  ShieldCheck,
  Gift,
  MessageCircle,
} from "lucide-react";
import { PublicShell } from "@/components/public/shell";
import { Button } from "@/components/ui/button";
import {
  STORE_CONTACT,
  SUPPORT_WHATSAPP_URL,
  GHANA_REGIONS,
  formatGHS,
} from "@/lib/ghana";

export const metadata = {
  title: "Delivery & Pickup — The Boys Store",
  description:
    "Delivery across all 10 regions of Ghana. Pickup at our Ashaley Botwe marketplace in Madina. See fees, ETAs, and how it works.",
};

export default function DeliveryPage() {
  return (
    <PublicShell>
      {/* ===== HERO SPLIT ===== */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid gap-10 lg:gap-16 lg:grid-cols-2 lg:items-center">
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                Delivery &amp; Pickup
              </p>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight">
                Delivery across Ghana —
                <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                  {" "}pickup in Madina.
                </span>
              </h1>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Every order ships insured and signed for. We deliver to all 10
                regions of Ghana, with same-day pickup available at our Ashaley
                Botwe marketplace.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild>
                  <Link href="/shop">
                    Start shopping
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <a
                    href={SUPPORT_WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Ask about delivery
                  </a>
                </Button>
              </div>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border">
              <Image
                src="/delivery/truck.jpg"
                alt="The Boys Store delivery gift box"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== REGIONS TABLE ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-2">
            Regional delivery
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight">
            Fees &amp; estimated times
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            All fees are in Ghana cedis. Estimated times are working days from
            dispatch. Pickup is available at our Ashaley Botwe marketplace in
            Madina, Greater Accra.
          </p>
        </div>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-4 font-medium">Region</th>
                <th className="p-4 font-medium text-right">Delivery fee</th>
                <th className="p-4 font-medium text-center">ETA (days)</th>
                <th className="p-4 font-medium text-center">Pickup</th>
                <th className="p-4 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {GHANA_REGIONS.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="p-4 font-medium">{r.name}</td>
                  <td className="p-4 text-right tabular-nums">
                    {formatGHS(r.fee)}
                  </td>
                  <td className="p-4 text-center tabular-nums">
                    {r.etaDays[0]}–{r.etaDays[1]}
                  </td>
                  <td className="p-4 text-center">
                    {r.pickupAvailable ? (
                      <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400">
                        <MapPin className="h-3.5 w-3.5" /> Yes
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {r.notes ?? "Standard signed delivery"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===== PICKUP ===== */}
      <section className="bg-muted/30 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid gap-10 lg:gap-16 lg:grid-cols-2 lg:items-start">
            <div className="space-y-4">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400">
                <MapPin className="h-5 w-5" />
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                Pickup at the team
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight">
                Collect your order in person.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Pickup is free at our Ashaley Botwe marketplace in Madina, Greater
                Accra. Place your order online, select pickup at checkout, and
                we&apos;ll have it ready for you — usually within 24 hours.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                  <span>{STORE_CONTACT.address}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                  <span>{STORE_CONTACT.hours}</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                  <span>ID required for pickup. We&apos;ll text you when your order is ready.</span>
                </li>
              </ul>
              <Button asChild className="mt-2">
                <Link href="/contact">Get directions</Link>
              </Button>
            </div>
            <div className="space-y-4">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border">
                <Image
                  src="/delivery/gift-box.jpg"
                  alt="quality goods gift box"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-2">
            How it works
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight">
            From order to your door.
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Package,
              step: "01",
              title: "You place your order",
              body: "Browse the collection and check out securely with Paystack. We confirm your order by WhatsApp.",
            },
            {
              icon: Gift,
              step: "02",
              title: "We hand-finish & pack",
              body: "Every item is hand-finished, inspected, and gift-packed in our Ashaley Botwe marketplace.",
            },
            {
              icon: Truck,
              step: "03",
              title: "We dispatch",
              body: "Insured, signed-for dispatch via our trusted Ghana courier partners. Pickup also available.",
            },
            {
              icon: ShieldCheck,
              step: "04",
              title: "You receive & enjoy",
              body: "Your item arrives with a certificate of authenticity and our lifetime craftsmanship guarantee.",
            },
          ].map(({ icon: Icon, step, title, body }) => (
            <div
              key={step}
              className="rounded-lg border border-border bg-card p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-serif text-2xl text-blue-600/40 dark:text-blue-400/40">
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
          ))}
        </div>
      </section>

      {/* ===== NOTES ===== */}
      <section className="bg-muted/30 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-2">
              Good to know
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight">
              Important notes
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Clock,
                title: "Processing time",
                body: "Orders are processed within 1–2 working days. Custom and made-to-order items may take longer — we'll keep you posted.",
              },
              {
                icon: ShieldCheck,
                title: "Insured & signed",
                body: "Every shipment is insured and requires a signature on delivery. We will not leave packages unattended.",
              },
              {
                icon: Gift,
                title: "Packaging",
                body: "Each item arrives in a branded gift box with a certificate of authenticity and care card.",
              },
              {
                icon: Truck,
                title: "International",
                body: "We currently deliver within Ghana only. For international shipping, please contact us on WhatsApp.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-lg border border-border bg-card p-6"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400">
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

      {/* ===== CTA ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
        <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
          Questions about delivery?
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-6">
          We&apos;re happy to help — chat with us on WhatsApp and we&apos;ll
              respond within working hours.
        </p>
        <Button asChild size="lg">
          <a
            href={SUPPORT_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Chat on WhatsApp
          </a>
        </Button>
      </section>
    </PublicShell>
  );
}
