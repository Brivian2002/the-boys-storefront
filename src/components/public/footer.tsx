import Link from "next/link";
import { Mail, Phone, MapPin, MessageCircle, Instagram, Facebook } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { STORE_CONTACT, SUPPORT_WHATSAPP_URL } from "@/lib/ghana";
import { NewsletterSignup } from "@/components/public/newsletter-signup";

const FOOTER_LINKS = {
  Shop: [
    { href: "/shop", label: "All Jewelry" },
    { href: "/shop?category=rings", label: "Rings" },
    { href: "/shop?category=earrings", label: "Earrings" },
    { href: "/shop?category=necklaces", label: "Necklaces" },
    { href: "/shop?category=bracelets", label: "Bracelets" },
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
    { href: "/shop?collection=Heritage", label: "Heritage Collection" },
    { href: "/shop?collection=Occasion", label: "Occasion Collection" },
    { href: "/shop?collection=Everyday", label: "Everyday Collection" },
  ],
};

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      {/* newsletter band */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <NewsletterSignup />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* brand */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo />
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              LA GLITZ is a premium Ghanaian jewelry house crafting fine rings,
              earrings, necklaces and bracelets in our Accra atelier. Each piece
              is hand-finished and made to be worn for a lifetime.
            </p>
            <div className="space-y-2 text-sm">
              <a
                href={SUPPORT_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageCircle className="h-4 w-4 text-[oklch(0.6_0.18_150)]" />
                Chat on WhatsApp
              </a>
              <a
                href={`mailto:${STORE_CONTACT.email}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-4 w-4" />
                {STORE_CONTACT.email}
              </a>
              <a
                href={`tel:${STORE_CONTACT.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="h-4 w-4" />
                {STORE_CONTACT.phone}
              </a>
              <p className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                {STORE_CONTACT.address}
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} LA GLITZ. Handcrafted in Accra, Ghana. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Payments secured by Paystack</span>
            <span className="hidden sm:inline">·</span>
            <Link href="/policies" className="hover:text-foreground transition-colors">
              Privacy & Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
