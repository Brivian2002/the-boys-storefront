/**
 * Blogger label parser.
 *
 * Converts Blogger post labels into a normalized Product object.
 *
 * Reserved label prefixes (system):
 *   product               - marks the post as a product
 *   price-<number>        - major-currency price (e.g. price-1250)
 *   currency-<code>       - GHS | USD
 *   category-<slug>       - rings | earrings | necklaces | bracelets | sets
 *   collection-<slug>     - free-form collection slug
 *   material-<slug>       - 18k-gold | 22k-gold | sterling-silver | ...
 *   availability-<slug>   - in-stock | sold-out | pre-order | limited
 *   featured | new-arrival | sale | bestseller | exclusive   - badges
 *   hidden                - excludes from public catalog
 *
 * Custom attributes use the convention:
 *   attribute-<name>--<value>
 *   e.g. attribute-ring-size--7
 *        attribute-gemstone--natural-emerald
 *
 * A post qualifies for the public catalog only when it has the `product` label
 * AND a valid `price-*` label, AND is not `hidden`.
 */

import type {
  Availability,
  Badge,
  Category,
  Currency,
  CustomAttribute,
  Product,
} from "./types";

const RESERVED_PREFIXES = [
  "product",
  "price-",
  "currency-",
  "category-",
  "collection-",
  "material-",
  "availability-",
  "hidden",
] as const;

const BADGE_LABELS = new Set<Badge>([
  "featured",
  "new-arrival",
  "sale",
  "bestseller",
  "exclusive",
]);

const VALID_CATEGORIES = new Set<Category>([
  "rings",
  "earrings",
  "necklaces",
  "bracelets",
  "sets",
  "new-arrivals",
]);

const VALID_AVAILABILITY = new Set<Availability>([
  "in-stock",
  "sold-out",
  "pre-order",
  "limited",
]);

const VALID_CURRENCIES = new Set<Currency>(["GHS", "USD"]);

export interface ParsedProduct {
  isProduct: boolean;
  isValid: boolean;
  isHidden: boolean;
  product?: Partial<Product>;
}

/**
 * Normalize a label string: lowercase, collapse whitespace,
 * collapse internal hyphens for slugs but keep attribute value hyphens.
 */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function titleCase(input: string): string {
  return input
    .split(/[-\s]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Parse a single Blogger label into a structured token.
 */
export interface LabelToken {
  type:
    | "product"
    | "price"
    | "currency"
    | "category"
    | "collection"
    | "material"
    | "availability"
    | "badge"
    | "hidden"
    | "attribute"
    | "unknown";
  value?: string;
  attrName?: string;
  attrValues?: string[];
  raw: string;
}

export function parseLabel(raw: string): LabelToken {
  const label = slugify(raw);
  const base: LabelToken = { type: "unknown", raw };

  if (label === "product") return { ...base, type: "product" };
  if (label === "hidden") return { ...base, type: "hidden" };

  if (label.startsWith("price-")) {
    const v = label.slice("price-".length).replace(/[^0-9.]/g, "");
    return { ...base, type: "price", value: v };
  }
  if (label.startsWith("currency-")) {
    const v = label.slice("currency-".length).toUpperCase();
    return { ...base, type: "currency", value: v };
  }
  if (label.startsWith("category-")) {
    const v = label.slice("category-".length);
    return { ...base, type: "category", value: v };
  }
  if (label.startsWith("collection-")) {
    const v = label.slice("collection-".length);
    return { ...base, type: "collection", value: v };
  }
  if (label.startsWith("material-")) {
    const v = label.slice("material-".length);
    return { ...base, type: "material", value: v };
  }
  if (label.startsWith("availability-")) {
    const v = label.slice("availability-".length);
    return { ...base, type: "availability", value: v };
  }
  if (label.startsWith("attribute-")) {
    const rest = label.slice("attribute-".length);
    const sep = rest.indexOf("--");
    if (sep === -1) {
      // single-value attribute
      return { ...base, type: "attribute", attrName: rest, attrValues: [] };
    }
    const name = rest.slice(0, sep);
    const value = rest.slice(sep + 2);
    return {
      ...base,
      type: "attribute",
      attrName: name,
      attrValues: value ? [titleCase(value)] : [],
    };
  }

  if (BADGE_LABELS.has(label as Badge)) {
    return { ...base, type: "badge", value: label };
  }

  return base;
}

/**
 * Parse a full set of Blogger labels into a partial Product.
 */
export function parseLabels(labels: string[]): {
  isProduct: boolean;
  isHidden: boolean;
  price?: number;
  currency?: Currency;
  category?: Category;
  collection?: string;
  materials: string[];
  availability?: Availability;
  badges: Badge[];
  attributes: CustomAttribute[];
} {
  const tokens = labels.map(parseLabel);

  let isProduct = false;
  let isHidden = false;
  let price: number | undefined;
  let currency: Currency | undefined;
  let category: Category | undefined;
  let collection: string | undefined;
  let availability: Availability | undefined;
  const materials = new Set<string>();
  const badges = new Set<Badge>();
  const attrMap = new Map<string, Set<string>>();

  for (const t of tokens) {
    switch (t.type) {
      case "product":
        isProduct = true;
        break;
      case "hidden":
        isHidden = true;
        break;
      case "price":
        if (t.value) {
          const n = parseFloat(t.value);
          if (!Number.isNaN(n) && n >= 0) price = n;
        }
        break;
      case "currency":
        if (t.value && VALID_CURRENCIES.has(t.value as Currency)) {
          currency = t.value as Currency;
        }
        break;
      case "category":
        if (t.value && VALID_CATEGORIES.has(t.value as Category)) {
          category = t.value as Category;
        }
        break;
      case "collection":
        if (t.value) collection = t.value;
        break;
      case "material":
        if (t.value) materials.add(titleCase(t.value));
        break;
      case "availability":
        if (t.value && VALID_AVAILABILITY.has(t.value as Availability)) {
          availability = t.value as Availability;
        }
        break;
      case "badge":
        if (t.value) badges.add(t.value as Badge);
        break;
      case "attribute":
        if (t.attrName) {
          const set = attrMap.get(t.attrName) ?? new Set<string>();
          for (const v of t.attrValues ?? []) set.add(v);
          attrMap.set(t.attrName, set);
        }
        break;
    }
  }

  const attributes: CustomAttribute[] = Array.from(attrMap.entries())
    .filter(([name]) => !isReservedName(name))
    .map(([name, values]) => ({
      name: titleCase(name),
      values: Array.from(values),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    isProduct,
    isHidden,
    price,
    currency,
    category,
    collection: collection ? titleCase(collection) : undefined,
    materials: Array.from(materials).sort(),
    availability,
    badges: Array.from(badges),
    attributes,
  };
}

function isReservedName(name: string): boolean {
  const n = name.toLowerCase();
  return RESERVED_PREFIXES.some((p) => n === p || n.startsWith(p));
}

/**
 * Generate the labels for a product when writing back to Blogger.
 */
export function serializeProductToLabels(input: {
  price: number;
  currency: Currency;
  category: Category;
  collection?: string;
  materials: string[];
  availability: Availability;
  badges: Badge[];
  attributes: CustomAttribute[];
  hidden?: boolean;
}): string[] {
  const labels = new Set<string>();
  labels.add("product");
  labels.add(`price-${input.price}`);
  labels.add(`currency-${input.currency}`);
  labels.add(`category-${input.category}`);
  if (input.collection) {
    labels.add(`collection-${slugify(input.collection)}`);
  }
  for (const m of input.materials) {
    labels.add(`material-${slugify(m)}`);
  }
  labels.add(`availability-${input.availability}`);
  for (const b of input.badges) {
    labels.add(b);
  }
  if (input.hidden) {
    labels.add("hidden");
  }
  for (const attr of input.attributes) {
    const name = slugify(attr.name);
    if (!name || isReservedName(name)) continue;
    for (const v of attr.values) {
      const valSlug = slugify(v);
      if (!valSlug) continue;
      labels.add(`attribute-${name}--${valSlug}`);
    }
  }
  return Array.from(labels);
}

/**
 * Convert a product title to a URL-safe slug.
 */
export function titleToSlug(title: string): string {
  return slugify(title);
}

export { slugify, titleCase };
