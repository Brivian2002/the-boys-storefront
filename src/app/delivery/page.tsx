import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Truck,
  PackageCheck,
  Store,
  ShieldCheck,
  Clock,
  MessageCircle,
  Sparkles,
  CreditCard,
} from "lucide-react";
import { PublicShell } from "@/components/public/shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  STORE_CONTACT,
  SUPPORT_WHATSAPP_URL,
  formatGHS,
} from "@/lib/ghana";
import { getStoreConfig } from "@/lib/blogger/config-store";

export const metadata: Metadata = {
  title: "Delivery & Pickup",
  description:
    "Delivery across Ghana with clear regional fees, careful packaging, and tracked handover from the LA GLITZ atelier.",
  alternates: { canonical: "/delivery" },
  openGraph: {
    title: "Delivery & Pickup · LA GLITZ",
    description:
      "Ghana-wide delivery with insured, signature-required shipping and regional fees shown clearly at checkout.",
  },
};

const STEPS = [
  {
    icon: CreditCard,
    title: "Order online",
    body: "Place your order through our secure Paystack checkout. We accept Visa, Mastercard, Verve and mobile money.",
  },
  {
    icon: PackageCheck,
    title: "We prepare your piece",
    body: "Most pieces ship within 1–3 business days. Custom and commissioned pieces take longer — we'll confirm timing at order.",
  },
  {
    icon: Truck,
    title: "Dispatch or pickup",
    body: "Choose home delivery across Ghana with the fee for your region shown at checkout, or arrange pickup at our Osu atelier or Kumasi partner location.",
  },
  {
    icon: ShieldCheck,
    title: "Receive & enjoy",
    body: "Insured, signature-required shipping. Your piece arrives in LA GLITZ packaging with its certificate of authenticity.",
  },
];

const NOTES = [
  {
    icon: Clock,
    title: "Processing time",
    body: "In-stock pieces ship within 1–3 business days. Made-to-order and commissioned pieces take 2–4 weeks; we'll confirm timing when you order.",
  },
  {
    icon: ShieldCheck,
    title: "Insured & signed for",
    body: "Every shipment is fully insured for its declared value and requires a signature on delivery. Please have ID available for the courier.",
  },
  {
    icon: PackageCheck,
    title: "Packaging",
    body: "Each piece ships in signature LA GLITZ packaging with its certificate of authenticity and care card. Gift wrapping available on request at no charge.",
  },
  {
    icon: Truck,
    title: "International shipping",
    body: "We currently ship within Ghana only. For international delivery, please contact us on WhatsApp and we'll arrange a courier quote for your destination.",
  },
];

export default async function DeliveryPage() {
  const { regions } = await getStoreConfig();
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
              <BreadcrumbPage>Delivery & Pickup</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* ===== HERO ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-3xl">
          <Badge variant="secondary" className="mb-5">
            <Truck className="h-3 w-3 mr-1.5" />
            Ghana-wide delivery
          </Badge>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight">
            Delivery across <span className="text-gold-gradient">Ghana.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl">
            We deliver across Ghana, bringing you beautiful jewelry from the LA GLITZ atelier. Every order is carefully packaged, insured, tracked, and signed for, with the delivery fee for your region shown clearly at checkout.
          </p>
        </div>
      </section>

      {/* ===== DELIVERY PROMISE ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <div className="rounded-lg border border-gold/30 bg-gold-soft p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-background text-foreground border border-border">
            <Sparkles className="h-5 w-5 text-gold" />
          </div>
          <div className="flex-1">
            <h2 className="font-serif text-xl sm:text-2xl font-semibold">Carefully packaged, delivered across Ghana.</h2>
            <p className="text-sm text-muted-foreground mt-1">Regional delivery fees are shown before payment. Pickup is available by arrangement at selected locations.</p>
          </div>
          <Button asChild className="shrink-0">
            <Link href="/shop">Shop the collection<ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* ===== REGIONS TABLE ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-2xl mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
            Regions & fees
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
            Delivery fees by region.
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Flat fees, no surprises. All shipments are insured and require a
            signature on delivery.
          </p>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="h-12 px-4 font-semibold">
                    Region
                  </TableHead>
                  <TableHead className="h-12 px-4 font-semibold">
                    Delivery fee
                  </TableHead>
                  <TableHead className="h-12 px-4 font-semibold">
                    Estimated delivery
                  </TableHead>
                  <TableHead className="h-12 px-4 font-semibold">
                    Pickup
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regions.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="px-4 py-3 align-top">
                      <div className="font-medium text-foreground">
                        {r.name}
                      </div>
                      {r.notes && (
                        <div className="text-xs text-muted-foreground mt-0.5 max-w-xs">
                          {r.notes}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 align-top font-medium">
                      {formatGHS(r.fee)}
                    </TableCell>
                    <TableCell className="px-4 py-3 align-top text-muted-foreground">
                      {r.etaDays[0]}–{r.etaDays[1]} business days
                    </TableCell>
                    <TableCell className="px-4 py-3 align-top">
                      {r.pickupAvailable ? (
                        <Badge
                          variant="outline"
                          className="border-gold/40 text-gold bg-gold-soft/50"
                        >
                          <Store className="h-3 w-3 mr-1" />
                          Available
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Delivery only
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <p className="text-xs text-muted-foreground mt-4">
          Fees are per shipment, not per item. Multiple items in one order ship
          together at a single fee.
        </p>
      </section>

      {/* ===== PICKUP ===== */}
      <section className="bg-muted/30 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid gap-10 lg:gap-16 lg:grid-cols-2 lg:items-start">
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Pickup option
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
                Pick up at the atelier — for free.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Skip the delivery fee and pick up your order at our Osu atelier
                in Accra, or at our Kumasi partner location. Pickup is available
                in Greater Accra and Ashanti regions, and is always free.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Orders are usually ready for pickup within 1–3 business days.
                We'll message you on WhatsApp the moment your piece is packed
                and ready.
              </p>
              <div className="rounded-lg border border-border bg-card p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <Store className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{STORE_CONTACT.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {STORE_CONTACT.address}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Atelier hours</p>
                    <p className="text-sm text-muted-foreground">
                      {STORE_CONTACT.hours}
                    </p>
                  </div>
                </div>
              </div>
              <Button asChild variant="outline">
                <Link href="/contact">Book a private viewing</Link>
              </Button>
            </div>

            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                How it works
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
                From order to your hands.
              </h2>
              <div className="grid gap-4">
                {STEPS.map(({ icon: Icon, title, body }, i) => (
                  <div
                    key={title}
                    className="flex gap-4 rounded-lg border border-border bg-card p-5"
                  >
                    <div className="flex flex-col items-center">
                      <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-soft text-foreground">
                        <Icon className="h-5 w-5" />
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className="w-px flex-1 bg-border mt-2" />
                      )}
                    </div>
                    <div className="pb-2">
                      <h3 className="font-serif text-lg font-semibold mb-1">
                        {title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== IMPORTANT NOTES ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-2xl mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
            Good to know
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
            Important notes.
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {NOTES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-lg border border-border bg-card p-6"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-gold-soft text-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-base font-semibold mb-2">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== WHATSAPP CTA ===== */}
      <section className="relative overflow-hidden border-t border-border bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight max-w-2xl mx-auto leading-tight">
            Have a question about delivery?
          </h2>
          <p className="mt-4 text-background/75 max-w-xl mx-auto">
            Message us on WhatsApp and our team will help — typically within an
            hour during atelier hours.
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
              <Link href="/contact">Contact us</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
