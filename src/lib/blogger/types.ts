/**
 * Product domain types for The Boys Store.
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
  | "rings"
  | "earrings"
  | "necklaces"
  | "bracelets"
  | "watches"
  | "brooches"
  | "sets"
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
  /** primary material, e.g. "18k gold" */
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
  rings: "Electronics",
  earrings: "Fashion & Apparel",
  necklaces: "Home & Living",
  bracelets: "Beauty & Wellness",
  watches: "Gadgets & Accessories",
  brooches: "Services",
  sets: "Bundles & Deals",
  "new-arrivals": "New Arrivals",
};
export const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  rings: "Everyday electronics, useful accessories, and smart devices for modern living.",
  earrings: "Clothing, shoes, bags, and style essentials for every occasion.",
  necklaces: "Practical home, kitchen, office, and lifestyle products chosen for value.",
  bracelets: "Beauty, personal care, wellness, and self-care essentials.",
  watches: "Mobile accessories, gadgets, and tech add-ons that keep you connected.",
  brooches: "Book a service, find a skilled provider, or get help with your next task.",
  sets: "Curated bundles and multi-item deals designed to make shopping easier.",
  "new-arrivals": "Fresh products, services, and limited finds newly added to The Boys Store.",
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
