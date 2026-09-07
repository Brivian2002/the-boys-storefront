/**
 * Site settings domain types.
 *
 * SiteSettings is the owner-editable public configuration: announcement bar,
 * brand identity, contact details, social links, maps query, delivery copy,
 * and the per-region delivery table. Stored as JSON in the SiteSetting table
 * under the single key "site.settings".
 */

import type { DeliveryRegion } from "@/lib/ghana";

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  whatsapp?: string;
}

export interface BrandSettings {
  name: string;
  tagline: string;
  /** short descriptor used in metadata + hero */
  description: string;
  /** founder name shown on About + admin user dropdown */
  founderName: string;
}

export interface ContactSettings {
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  hours: string;
}

export interface MapsSettings {
  /** Google Maps embed query */
  query: string;
}

export interface DeliveryCopySettings {
  /** headline shown above the delivery regions table */
  headline: string;
  /** short paragraph about worldwide shipment */
  worldwide: string;
  /** short paragraph about payment on delivery / pickup */
  paymentOnDelivery: string;
  /** short paragraph about the Cantonments pickup location */
  pickup: string;
}

export interface SiteSettings {
  announcement: string;
  brand: BrandSettings;
  contact: ContactSettings;
  social: SocialLinks;
  maps: MapsSettings;
  delivery: DeliveryCopySettings;
  regions: DeliveryRegion[];
  updatedAt: string;
}
