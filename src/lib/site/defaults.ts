/**
 * Default site settings for Afrocentric Jewelry by LaGlitz.
 *
 * These are the immutable seed values used the first time getSiteSettings()
 * runs against an empty database, and as the fallback if a field is somehow
 * missing. The owner can override everything from /admin/settings.
 */

import { GHANA_REGIONS } from "@/lib/ghana";
import type { SiteSettings } from "./types";

export const DEFAULT_SETTINGS: SiteSettings = {
  announcement:
    "Handcrafted Afrocentric jewelry from Accra · Worldwide shipment available",
  brand: {
    name: "Afrocentric Jewelry by LaGlitz",
    tagline: "Africa Arising",
    description:
      "Premium Afrocentric jewelry handcrafted in Accra, Ghana — beads, gold, cowrie, kente-inspired designs for the modern African woman.",
    founderName: "Charity Kessewaa Frimpong",
  },
  contact: {
    email: "laglitz@gmail.com",
    phone: "+233 55 454 5900",
    whatsapp: "+233 55 454 5900",
    address: "Ashaley Botwe, Madina, Ghana",
    hours: "Mon–Fri, 9:00 AM – 5:00 PM · Sat & Sun closed",
  },
  social: {
    instagram: "https://www.instagram.com/_laglitzj/",
    facebook: "https://www.facebook.com/Laglitzj/",
    whatsapp: "https://wa.me/233554545900",
  },
  maps: {
    query: "Afrocentric Jewelry by LaGlitz, Madina, Ghana",
  },
  delivery: {
    headline: "Delivery across Ghana & worldwide",
    worldwide:
      "We ship worldwide via DHL and FedEx. International shipping is calculated per destination and confirmed with you before dispatch.",
    paymentOnDelivery:
      "Payment on delivery is available within Greater Accra for orders above GH₵500. Pay with cash or mobile money when your piece arrives.",
    pickup:
      "Prefer to collect? Arrange a pickup at our Cantonments office — message us on WhatsApp after placing your order.",
  },
  regions: GHANA_REGIONS,
  updatedAt: new Date(0).toISOString(),
};
