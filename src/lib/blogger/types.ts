/**
 * Product domain types for The Boyz Store.
 *
 * The public storefront only ever sees these typed objects — never raw
 * Blogger posts, labels, or URLs. Products are authored in Blogger (the
 * owner's CMS of choice) and round-tripped through the label parser +
 * JSON-in-HTML-comment serializer.
 */

export type Currency = "GHS" | "USD";

export type Availability = "in-stock" | "sold-out" | "pre-order" | "limited";

export type Badge =
  | "featured"
  | "new-arrival"
  | "sale"
  | "bestseller"
  | "exclusive";

export type Category =
  | "electronics"
  | "fashion"
  | "home"
  | "gadgets"
  | "sports"
  | "services"
  | "bundles"
  | "new-arrivals";

export interface CustomAttribute {
  name: string;
  values: string[];
}

export interface ProductImage {
  url: string;
  alt?: string;
  position?: number;
}

export interface Product {
  /** Blogger post id — opaque to customers */
  id: string;
  /** URL slug derived from post title */
  slug: string;
  name: string;
  description: string;
  /** Long-form HTML description (sanitized) */
  descriptionHtml?: string;
  /** Major-currency price (e.g. GHS 1250.00) */
  price: number;
  currency: Currency;
  originalPrice?: number;
  category: Category;
  collection?: string;
  /** primary product attribute, e.g. "Wireless", "Cotton", or "Remote" */
  material: string;
  materials: string[];
  availability: Availability;
  badges: Badge[];
  images: ProductImage[];
  attributes: CustomAttribute[];
  /** ISO timestamp of publication */
  publishedAt: string;
  updatedAt: string;
  status: "published" | "draft" | "hidden";
}

export interface ProductFacet {
  field: string;
  label: string;
  values: { value: string; count: number }[];
}

export interface CatalogResult {
  products: Product[];
  total: number;
  facets: ProductFacet[];
}

export interface CatalogQuery {
  search?: string;
  category?: Category | "all";
  collection?: string;
  material?: string;
  availability?: Availability | "all";
  badges?: Badge[];
  /** major units */
  minPrice?: number;
  maxPrice?: number;
  /** attribute field name -> selected values */
  attributes?: Record<string, string[]>;
  sort?: "newest" | "price-asc" | "price-desc" | "popular";
  page?: number;
  pageSize?: number;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  electronics: "Electronics & Tech",
  fashion: "Fashion & Apparel",
  home: "Home & Living",
  gadgets: "Mobile & Gadgets",
  sports: "Sports & Outdoors",
  services: "Services",
  bundles: "Bundles & Deals",
  "new-arrivals": "New Arrivals",
};
export const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  electronics: "Phones, computers, audio, smart devices, and practical tech for modern living.",
  fashion: "Clothing, shoes, bags, and style essentials for every occasion.",
  home: "Practical home, kitchen, office, and lifestyle products chosen for value.",
  gadgets: "Chargers, cases, accessories, and everyday gadgets that keep you connected.",
  sports: "Fitness gear, outdoor essentials, sports equipment, and active-living finds.",
  services: "Book a service, find a skilled provider, or get help with your next task.",
  bundles: "Curated bundles and multi-item deals designed to make shopping easier.",
  "new-arrivals": "Fresh products, services, and limited finds newly added to The Boyz Store.",
};
export const AVAILABILITY_LABELS: Record<Availability, string> = {
  "in-stock": "In stock",
  "sold-out": "Sold out",
  "pre-order": "Pre-order",
  limited: "Limited stock",
};

export const BADGE_LABELS: Record<Badge, string> = {
  featured: "Featured",
  "new-arrival": "New",
  sale: "Sale",
  bestseller: "Bestseller",
  exclusive: "Exclusive",
};
