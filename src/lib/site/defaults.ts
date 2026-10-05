/**
 * Default site settings for The Boyz Store.
 *
 * These are the immutable seed values used the first time getSiteSettings()
 * runs against an empty database, and as the fallback if a field is somehow
 * missing. The owner can override everything from /admin/settings.
 */

import { GHANA_REGIONS } from "@/lib/ghana";
import type { SiteSettings } from "./types";

export const BRAND_NAME = "The Boyz Store";
export const LEGAL_BUSINESS_NAME = "The Boyz Store Marketplace";

export const DEFAULT_SETTINGS: SiteSettings = {
  announcement:
    "A curated marketplace for everyday goods, services, and smart finds · Shop online with confidence",
  brand: {
    name: BRAND_NAME,
    tagline: "Smart shopping, simply",
    description:
      "A professional online marketplace for useful products, trusted services, and standout finds for everyday life.",
    founderName: "Joshua Nasi Words",
  },
  legalBusinessName: LEGAL_BUSINESS_NAME,
  contact: {
    email: "support@theboyzstore.example",
    phone: "+233 20 000 0000",
    whatsapp: "+233 20 000 0000",
    address: "Online marketplace · Ghana & worldwide",
    hours: "Mon–Fri, 9:00 AM – 5:00 PM · Sat & Sun closed",
  },
  social: {
    instagram: "https://www.instagram.com/theboyzstore",
    facebook: "https://www.facebook.com/TheBoysStore/",
    whatsapp: "https://wa.me/233200000000",
  },
  maps: {
    query: "The Boyz Store online marketplace",
  },
  delivery: {
    headline: "Reliable delivery, wherever you shop",
    worldwide:
      "We are building flexible delivery options for local and international shoppers. Delivery details are confirmed at checkout.",
    paymentOnDelivery:
      "Payment options and availability will be confirmed for each product or service at checkout.",
    pickup:
      "Need help with an order or service? Contact The Boyz Store team through the site.",
  },
  regions: GHANA_REGIONS,
  updatedAt: new Date(0).toISOString(),
};
