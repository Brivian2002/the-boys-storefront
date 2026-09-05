/**
 * Product domain types for LA GLITZ.
 *
 * These types are derived from Blogger posts via the label parser.
 * The public storefront only ever sees these typed objects - never raw
 * Blogger posts, labels, or URLs.
 */

export type Currency = "GHS" | "USD";

export type Availability = "in-stock" | "sold-out" | "pre-order" | "limited";

export type Badge = "featured" | "new-arrival" | "sale" | "bestseller" | "exclusive";

export type Category =
  | "rings"
  | "earrings"
  | "necklaces"
  | "bracelets"
  | "sets"
  | "new-arrivals";

export interface CustomAttribute {
  name: string;
  values: string[];
}

export interface ProductImage {
  url: string;
  alt?: string;
}

export interface Product {
  /** Blogger post id - opaque to customers */
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
  rings: "Rings",
  earrings: "Earrings",
  necklaces: "Necklaces",
  bracelets: "Bracelets",
  sets: "Sets",
  "new-arrivals": "New Arrivals",
};

export const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  rings:
    "Engagement, statement and everyday rings crafted in 18k and 22k gold with natural and lab-created gemstones.",
  earrings:
    "Studs, drops and hoops designed in our Accra atelier - from delicate daily wear to bold occasion pieces.",
  necklaces:
    "Chains, pendants and layered necklaces in solid gold and gold-fill, finished by hand.",
  bracelets:
    "Bangles, cuffs and chain bracelets inspired by Ghanaian craft heritage.",
  sets:
    "Coordinated jewellery sets for weddings, outdooring and milestone celebrations.",
  "new-arrivals":
    "The newest pieces from the LA GLITZ workshop - fresh from the bench in Accra.",
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
