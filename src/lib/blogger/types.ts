/**
 * Product domain types for Afrocentric Jewelry by LaGlitz.
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
  rings: "Rings",
  earrings: "Earrings",
  necklaces: "Necklaces",
  bracelets: "Bracelets",
  watches: "Watches",
  brooches: "Brooches",
  sets: "Sets",
  "new-arrivals": "New Arrivals",
};

export const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  rings:
    "Afrocentric rings — gold bands, cowrie and bead statement rings, kente-inspired wedding bands handcrafted in Accra.",
  earrings:
    "Hoop, drop and stud earrings drawing on Ghanaian beadwork, cowrie shells and gold filigree.",
  necklaces:
    "Beaded, cowrie and gold-tone necklaces layered with meaning — from everyday wear to ceremonial pieces.",
  bracelets:
    "Bangles, cuffs and beaded bracelets inspired by Ghanaian craft heritage and Adinkra symbolism.",
  watches:
    "Afrocentric timepieces pairing watch faces with beaded, kente and gold-tone straps.",
  brooches:
    "Statement brooches and pins — Adinkra symbols, cowrie and bead clusters for lapel, headwrap or bag.",
  sets:
    "Coordinated Afrocentric jewelry sets for weddings, outdooring and milestone celebrations.",
  "new-arrivals":
    "The newest pieces fresh from the LaGlitz workshop in Ashaley Botwe, Accra.",
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
