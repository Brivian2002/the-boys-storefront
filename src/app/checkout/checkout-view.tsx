"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  Loader2,
  Truck,
  Mail,
  MapPin,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCart } from "@/stores/cart";
import type { CartLine } from "@/stores/cart";
import { useCartHydrated } from "@/components/cart/cart-provider";
import { formatGHS, GHANA_REGIONS } from "@/lib/ghana";

interface Region {
  id: string;
  name: string;
  fee: number;
  etaDays: [number, number];
  pickupAvailable: boolean;
  notes?: string;
}

interface PublicSettings {
  brand?: { name?: string };
  delivery?: { regions?: Region[] };
  regions?: Region[];
  announcement?: string;
}

interface CheckoutResponse {
  reference: string;
  authorizationUrl: string;
  demo?: boolean;
  summary: {
    itemsTotal: number;
    deliveryFee: number;
    grandTotal: number;
    currency: "GHS" | "USD";
    region: string;
  };
}

interface ApiError {
  error: string;
  details?: unknown;
}

export function CheckoutView() {
  const hydrated = useCartHydrated();
  const lines = useCart((s) => s.lines);
  const subtotal = useCart((s) => s.subtotal());

  const [regions, setRegions] = React.useState<Region[]>([]);
  const [settingsLoading, setSettingsLoading] = React.useState(true);

  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [name, setName] = React.useState("");
  const [deliveryPhone, setDeliveryPhone] = React.useState("");
  const [regionId, setRegionId] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch regions from /api/settings
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/settings", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load settings");
        const data = (await res.json()) as PublicSettings;
        if (cancelled) return;
        // /api/settings exposes editable regions at the top level. Keep the
        // nested form as a compatibility fallback for older deployments.
        setRegions(data.regions ?? data.delivery?.regions ?? GHANA_REGIONS);
      } catch {
        // Keep checkout usable if the settings request is temporarily down.
        if (!cancelled) setRegions(GHANA_REGIONS);
      } finally {
        if (!cancelled) setSettingsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!hydrated || settingsLoading) {
    return (
      <>
        <CheckoutHeader />
        <CheckoutSkeleton />
      </>
    );
  }

  if (lines.length === 0) {
    return (
      <>
        <CheckoutHeader />
        <div className="flex flex-col items-center justify-center text-center py-16 sm:py-24 px-4">
          <div className="mb-5 inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Truck className="h-8 w-8" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold mb-2">
            Your bag is empty
          </h2>
          <p className="text-muted-foreground max-w-md mb-7">
            Add a item to your bag before heading to checkout.
          </p>
          <Button asChild size="lg" className="text-base">
            <Link href="/shop">Explore the marketplace</Link>
          </Button>
        </div>
      </>
    );
  }

  const region = regions.find((r) => r.id === regionId);
  const deliveryFee = region?.fee ?? 0;
  const grandTotal = subtotal + deliveryFee;

  function validate(): string | null {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      return "Please enter a valid email address.";
    if (!phone || phone.length < 6)
      return "Please enter a valid contact phone number.";
    if (!name || name.trim().length < 2)
      return "Please enter the recipient's name.";
    if (!deliveryPhone || deliveryPhone.length < 6)
      return "Please enter the recipient's phone number.";
    if (!regionId) return "Please select a delivery region.";
    if (!address || address.trim().length < 5)
      return "Please enter a delivery address.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        email,
        phone,
        lines: lines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          attributes: l.attributes,
        })),
        delivery: {
          name,
          phone: deliveryPhone,
          regionId,
          address,
          notes,
        },
      };
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as CheckoutResponse | ApiError;
      if (!res.ok) {
        const msg =
          (data as ApiError).error ?? "Checkout failed. Please try again.";
        throw new Error(msg);
      }
      const { authorizationUrl } = data as CheckoutResponse;
      window.location.href = authorizationUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <CheckoutHeader />
      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-5 lg:gap-10">
        {/* Left: forms */}
        <div className="lg:col-span-3 space-y-6">
          {/* Contact */}
          <section className="rounded-lg border border-border bg-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h2 className="font-serif text-xl font-semibold">Contact</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" htmlFor="email" required>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </Field>
              <Field label="Phone" htmlFor="phone" required>
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="024 000 0000"
                  required
                />
              </Field>
            </div>
            <p className="text-xs text-muted-foreground">
              We&apos;ll send your order confirmation and tracking updates here.
            </p>
          </section>

          {/* Delivery */}
          <section className="rounded-lg border border-border bg-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h2 className="font-serif text-xl font-semibold">Delivery</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Recipient name" htmlFor="name" required>
                <Input
                  id="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Akosua Mensah"
                  required
                />
              </Field>
              <Field label="Recipient phone" htmlFor="deliveryPhone" required>
                <Input
                  id="deliveryPhone"
                  type="tel"
                  autoComplete="tel"
                  value={deliveryPhone}
                  onChange={(e) => setDeliveryPhone(e.target.value)}
                  placeholder="024 000 0000"
                  required
                />
              </Field>
            </div>
            <Field label="Region" htmlFor="region" required>
              <Select value={regionId} onValueChange={setRegionId}>
                <SelectTrigger id="region" className="w-full" aria-label="Select delivery region">
                  <SelectValue placeholder="Select a region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name} — {formatGHS(r.fee)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Delivery address" htmlFor="address" required>
              <Textarea
                id="address"
                autoComplete="street-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House number, street, area, landmark..."
                rows={3}
                required
              />
            </Field>
            <Field label="Order notes (optional)" htmlFor="notes">
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Delivery instructions, gift message, etc."
                rows={2}
              />
            </Field>

            {region && (
              <div className="rounded-md border border-teal-500/30 bg-blue-600/5 p-3 text-sm">
                <p className="font-medium">
                  {region.name}
                  <span className="ml-2 text-muted-foreground font-normal">
                    · ETA {region.etaDays[0]}–{region.etaDays[1]} business days
                  </span>
                </p>
                <p className="mt-1 text-muted-foreground">
                  Delivery fee:{" "}
                  <span className="font-medium text-foreground">
                    {formatGHS(region.fee)}
                  </span>
                </p>
                {region.pickupAvailable && region.notes && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {region.notes}
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Payment */}
          <section className="rounded-lg border border-border bg-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h2 className="font-serif text-xl font-semibold">Payment</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You&apos;ll be redirected to Paystack&apos;s secure checkout to
              complete payment. We never see or store your card details. Mobile
              money, cards, and bank transfer are supported.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
              <span>256-bit encrypted · PCI DSS compliant</span>
            </div>
          </section>
        </div>

        {/* Right: order summary */}
        <aside className="lg:col-span-2">
          <div className="lg:sticky lg:top-24 rounded-lg border border-border bg-card p-5 sm:p-6 space-y-4">
            <h2 className="font-serif text-xl font-semibold">Order summary</h2>
            <Separator />
            {/* Line items (compact) */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {lines.map((line) => (
                <SummaryLine key={`${line.productId}-${JSON.stringify(line.attributes)}`} line={line} />
              ))}
            </div>
            <Separator />
            <div className="space-y-2.5 text-sm">
              <Row label="Items" value={formatGHS(subtotal)} />
              <Row
                label="Delivery"
                value={
                  !region
                    ? "Select region"
                    : formatGHS(deliveryFee)
                }
              />
            </div>
            <Separator />
            <div className="flex items-baseline justify-between">
              <span className="font-medium">Total</span>
              <span className="font-serif text-2xl font-semibold">
                {region ? formatGHS(grandTotal) : formatGHS(subtotal)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Final total is recomputed on our server before payment — your
              bag&apos;s display prices are for convenience only.
            </p>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Couldn&apos;t start checkout</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="w-full h-12 text-base"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Redirecting to Paystack...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Pay {region ? formatGHS(grandTotal) : "at checkout"}
                </>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Secured by Paystack</span>
            </div>
          </div>
        </aside>
      </form>
    </>
  );
}

function CheckoutHeader() {
  return (
    <header className="mb-8">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link href="/cart">
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to bag
        </Link>
      </Button>
      <p className="text-xs uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-2">
        Almost yours
      </p>
      <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight">
        Checkout
      </h1>
    </header>
  );
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function SummaryLine({ line }: { line: CartLine }) {
  const attrs = Object.entries(line.attributes);
  return (
    <div className="flex gap-3">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
        <Image
          src={line.image}
          alt={line.name}
          fill
          sizes="56px"
          className="object-cover"
          unoptimized
          onError={(event) => {
            event.currentTarget.style.opacity = "0";
          }}
        />
        <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[0.65rem] font-semibold text-background">
          {line.quantity}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-snug line-clamp-2">
          {line.name}
        </p>
        {attrs.length > 0 && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {attrs.map(([k, v]) => `${k}: ${v}`).join(" · ")}
          </p>
        )}
      </div>
      <div className="text-sm font-medium whitespace-nowrap">
        {formatGHS(line.unitPrice * line.quantity, line.currency)}
      </div>
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
      <div className="lg:col-span-3 space-y-6">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-72 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
      <div className="lg:col-span-2">
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    </div>
  );
}
