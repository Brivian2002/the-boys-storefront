import * as React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, MessageCircle, Instagram, Facebook, Clock } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { NewsletterSignup } from "@/components/public/newsletter-signup";
import type { BrandSettings, ContactSettings, SocialLinks } from "@/lib/site/types";

interface PublicFooterProps {
  brand: BrandSettings;
  legalBusinessName: string;
  contact: ContactSettings;
  social: SocialLinks;
}

const FOOTER_LINKS = {
  Shop: [
    { href: "/shop", label: "All Jewelry" },
    { href: "/shop?category=rings", label: "Rings" },
    { href: "/shop?category=earrings", label: "Earrings" },
    { href: "/shop?category=necklaces", label: "Necklaces" },
    { href: "/shop?category=bracelets", label: "Bracelets" },
    { href: "/shop?category=watches", label: "Watches" },
    { href: "/shop?category=brooches", label: "Brooches" },
    { href: "/shop?category=sets", label: "Sets" },
    { href: "/shop?category=new-arrivals", label: "New Arrivals" },
  ],
  Help: [
    { href: "/delivery", label: "Delivery & Pickup" },
    { href: "/policies", label: "Returns & Policies" },
    { href: "/contact", label: "Contact Us" },
    { href: "/cart", label: "Shopping Bag" },
  ],
  House: [
    { href: "/about", label: "Our Story" },
    { href: "/blog", label: "The LaGlitz Journal" },
    { href: "/shop?collection=Occasion", label: "Occasion Collection" },
    { href: "/shop?collection=Everyday", label: "Everyday Collection" },
  ],
};

export function PublicFooter({ brand, legalBusinessName, contact, social }: PublicFooterProps) {
  const whatsappUrl =
    social.whatsapp ?? `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`;
  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      {/* newsletter band */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <NewsletterSignup />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* brand */}
          <div className="space-y-4 lg:col-span-2">
            <BrandLogo />
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {brand.description}
            </p>
            <div className="space-y-2 text-sm">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <MessageCircle className="h-4 w-4 text-turquoise" />
                Chat on WhatsApp
              </a>
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <Mail className="h-4 w-4" />
                {contact.email}
              </a>
              <a
                href={`tel:${contact.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <Phone className="h-4 w-4" />
                {contact.phone}
              </a>
              <p className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                {contact.address}
              </p>
              <p className="flex items-start gap-2 text-muted-foreground">
                <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                {contact.hours}
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              {social.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {social.facebook && (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {brand.name}. Handcrafted in Accra, Ghana. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/80">
            {brand.name} is operated by{" "}
            <span className="font-semibold text-amber-700 dark:text-amber-300">
              {legalBusinessName}
            </span>
            .
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Payments secured by Paystack</span>
            <span className="hidden sm:inline">·</span>
            <Link href="/policies" className="transition-colors hover:text-foreground">
              Privacy & Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
