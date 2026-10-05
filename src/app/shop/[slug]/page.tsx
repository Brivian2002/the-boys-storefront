import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Gem,
  Truck,
  ShieldCheck,
  RefreshCw,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { PublicShell } from "@/components/public/shell";
import { ProductCard } from "@/components/public/product-card";
import { ProductGallery } from "@/components/public/product-gallery";
import { AddToBag } from "@/components/public/add-to-bag";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import { getProductBySlug, getRelatedProducts } from "@/lib/blogger/client";
import {
  AVAILABILITY_LABELS,
  BADGE_LABELS,
  CATEGORY_LABELS,
} from "@/lib/blogger/types";
import { formatGHS, SUPPORT_WHATSAPP_URL } from "@/lib/ghana";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return {
      title: "Product not found",
      robots: { index: false, follow: false },
    };
  }
  const title = `${product.name} · The Boys Store`;
  const description =
    product.description?.slice(0, 160) ?? "Handcrafted quality goods from Ashaley Botwe, Madina, Ghana.";
  const ogImage = product.images[0]?.url;

  return {
    title,
    description,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      ...(ogImage
        ? { images: [{ url: ogImage, alt: product.images[0]?.alt ?? product.name }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product, 4);
  const sold = product.availability === "sold-out";
  const onSale =
    product.originalPrice && product.originalPrice > product.price;

  return (
    <PublicShell>
      {/* Breadcrumb */}
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
              <BreadcrumbLink asChild>
                <Link href="/shop">Shop</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/shop?category=${product.category}`}>
                  {CATEGORY_LABELS[product.category]}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Main layout */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid gap-8 lg:gap-12 lg:grid-cols-2">
          {/* Gallery */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ProductGallery images={product.images} name={product.name} />
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {product.collection && (
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {product.collection}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {CATEGORY_LABELS[product.category]}
                </span>
              </div>
              {product.badges.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {product.badges.map((b) => (
                    <Badge
                      key={b}
                      variant={b === "sale" ? "destructive" : "secondary"}
                      className={cn(
                        b === "sale"
                          ? "bg-destructive text-destructive-foreground"
                          : b === "new-arrival"
                          ? "bg-primary text-primary-foreground"
                          : b === "exclusive"
                          ? "bg-foreground text-background"
                          : "bg-amber-500 text-black"
                      )}
                    >
                      {BADGE_LABELS[b]}
                    </Badge>
                  ))}
                </div>
              )}
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Price + availability */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-3xl font-semibold">
                  {formatGHS(product.price, product.currency)}
                </span>
                {onSale && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatGHS(product.originalPrice!, product.currency)}
                  </span>
                )}
                {onSale && (
                  <span className="text-xs font-medium text-destructive uppercase tracking-wider">
                    Save{" "}
                    {formatGHS(
                      product.originalPrice! - product.price,
                      product.currency
                    )}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 text-sm font-medium",
                    sold
                      ? "text-muted-foreground"
                      : product.availability === "limited"
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      sold
                        ? "bg-muted-foreground"
                        : product.availability === "limited"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    )}
                  />
                  {AVAILABILITY_LABELS[product.availability]}
                </span>
              </div>
            </div>

            <Separator />

            {/* Short description */}
            {product.description && (
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Materials quick list */}
            {product.materials.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.materials.map((m) => (
                  <span
                    key={m}
                    className="inline-flex items-center rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium"
                  >
                    <Gem className="h-3 w-3 mr-1.5 text-teal-600 dark:text-teal-400" />
                    {m}
                  </span>
                ))}
              </div>
            )}

            {/* Add to bag */}
            <AddToBag product={product} />

            {/* WhatsApp enquiry */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Have a question about this piece, or want to discuss a custom
                order? Reach our atelier directly on WhatsApp.
              </p>
              <Button asChild variant="outline" size="sm">
                <a href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Ask on WhatsApp
                </a>
              </Button>
            </div>

            {/* Trust strip */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <TrustItem icon={Truck} title="Delivery" body="Ghana-wide" />
              <TrustItem icon={ShieldCheck} title="Authentic" body="Certificate incl." />
              <TrustItem icon={RefreshCw} title="Lifetime" body="Craft guarantee" />
            </div>
          </div>
        </div>

        {/* Full description + accordion */}
        <div className="mt-16 grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-semibold">The piece</h2>
            {product.descriptionHtml ? (
              <div
                className="max-w-none text-muted-foreground
                  [&_p]:leading-relaxed [&_li]:leading-relaxed [&_ul]:my-3 [&_p]:my-3
                  [&_li]:ml-5 [&_ul]:list-disc [&_li]:marker:text-gold"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            ) : (
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            )}
          </div>

          <div>
            <h2 className="font-serif text-2xl font-semibold mb-4">
              Good to know
            </h2>
            <Accordion type="single" collapsible defaultValue="details" className="w-full">
              <AccordionItem value="details">
                <AccordionTrigger className="text-base font-medium">
                  Details &amp; care
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-2">
                  <ul className="space-y-1.5">
                    <li>
                      <span className="font-medium text-foreground">Material:</span>{" "}
                      {product.materials.join(", ")}
                    </li>
                    {product.collection && (
                      <li>
                        <span className="font-medium text-foreground">Collection:</span>{" "}
                        {product.collection}
                      </li>
                    )}
                    {product.attributes
                      .filter((a) => a.values.length === 1)
                      .map((a) => (
                        <li key={a.name}>
                          <span className="font-medium text-foreground">{a.name}:</span>{" "}
                          {a.values.join(", ")}
                        </li>
                      ))}
                    <li>
                      <span className="font-medium text-foreground">Care:</span> Wipe
                      gently with a soft, lint-free cloth. Avoid contact with
                      perfumes, lotions and harsh chemicals. Store in the
                      provided pouch away from direct sunlight.
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping">
                <AccordionTrigger className="text-base font-medium">
                  Shipping &amp; returns
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-2">
                  <p>
                    Delivery is available across all 10 regions of Ghana.
                    Greater Accra orders ship in 1-3 business days; other
                    regions in 2-8 days. Free pickup is available at our
                    Ashaley Botwe atelier in Madina.
                  </p>
                  <p>
                    Each piece ships fully insured in a presentation box with a
                    certificate of authenticity. Pickup is available at our
                    Ashaley Botwe atelier in Madina at no charge.
                  </p>
                  <p>
                    Returns are accepted within 7 days of delivery for
                    unworn, unaltered pieces in original packaging. Custom and
                    engraved pieces are final sale.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="guarantee">
                <AccordionTrigger className="text-base font-medium">
                  Authenticity &amp; guarantee
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-2">
                  <p>
                    Every The Boys Store piece is hand-finished
                    in our Ashaley Botwe atelier in Madina — drawing on the
                    textures, symbols and spirit of Africa.
                  </p>
                  <p>
                    Each piece ships with a certificate of authenticity.
                    Manufacturing defects are covered by our lifetime
                    craftsmanship guarantee.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-20">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  You may also like
                </p>
                <h2 className="font-serif text-3xl font-semibold tracking-tight">
                  Complete the look
                </h2>
              </div>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href={`/shop?category=${product.category}`}>
                  More {CATEGORY_LABELS[product.category].toLowerCase()}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </section>
    </PublicShell>
  );
}

function TrustItem({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-center text-center rounded-lg border border-border bg-card p-3">
      <Icon className="h-5 w-5 text-teal-600 dark:text-teal-400 mb-1.5" />
      <span className="text-xs font-semibold">{title}</span>
      <span className="text-[0.7rem] text-muted-foreground">{body}</span>
    </div>
  );
}

