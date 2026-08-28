export type Availability = "in-stock" | "out-of-stock" | "preorder" | "hidden";

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  collection: string;
  materials: string[];
  availability: Availability;
  images: string[];
  badges: Array<"Featured" | "New arrival" | "Sale">;
  publishedAt: string;
};

export type CatalogFacets = {
  categories: string[];
  collections: string[];
  materials: string[];
  availability: Availability[];
};

export type CatalogResponse = {
  products: CatalogProduct[];
  facets: CatalogFacets;
};
