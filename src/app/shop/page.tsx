import type { Metadata } from "next";
import Link from "next/link";
import { SlidersHorizontal, Search, PackageSearch } from "lucide-react";
import { PublicShell } from "@/components/public/shell";
import { ProductCard } from "@/components/public/product-card";
import { ShopFilters } from "@/components/public/shop-filters";
import { SortSelect } from "@/components/public/sort-select";
import { ShopFiltersSheet } from "@/components/public/shop-filters-sheet";
import { ShopPagination } from "@/components/public/shop-pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { queryCatalog } from "@/lib/blogger/client";
import {
  CATEGORY_LABELS,
  type CatalogQuery,
  type Category,
} from "@/lib/blogger/types";

export const metadata: Metadata = {
  title: "Shop All Jewelry",
  description:
    "Browse the full LA GLITZ collection of handcrafted gold rings, earrings, necklaces, bracelets and sets. Made in Accra, Ghana.",
  alternates: { canonical: "/shop" },
};

const PAGE_SIZE = 12;
const ALL_CATEGORY_VALUES: Category[] = [
  "rings",
  "earrings",
  "necklaces",
  "bracelets",
  "sets",
  "new-arrivals",
];

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function arr(value: string | string[] | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  // Build the catalog query from URL params
  const query: CatalogQuery = {
    search: first(sp.q),
    category: first(sp.category) as CatalogQuery["category"],
    collection: first(sp.collection),
    material: first(sp.material),
    availability: first(sp.availability) as CatalogQuery["availability"],
    badges: arr(sp.badge) as CatalogQuery["badges"],
    minPrice: first(sp.minPrice) ? Number(first(sp.minPrice)) : undefined,
    maxPrice: first(sp.maxPrice) ? Number(first(sp.maxPrice)) : undefined,
    attributes: collectAttributes(sp),
    sort: (first(sp.sort) as CatalogQuery["sort"]) ?? "newest",
    page: first(sp.page) ? Math.max(1, Number(first(sp.page))) : 1,
    pageSize: PAGE_SIZE,
  };

  const result = await queryCatalog(query);

  const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));
  const currentPage = query.page ?? 1;

  const currentCategory =
    query.category && query.category !== "all" ? query.category : undefined;
  const headerTitle = currentCategory
    ? CATEGORY_LABELS[currentCategory as Category] ?? "All Jewelry"
    : query.search
    ? `Search: "${query.search}"`
    : "All Jewelry";

  const allCategoryValues = ALL_CATEGORY_VALUES;

  return (
    <PublicShell>
      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {currentCategory ? (
                <BreadcrumbLink asChild>
                  <Link href="/shop">Shop</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>Shop</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {currentCategory && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{headerTitle}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Header */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
                The Collection
              </p>
              <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight">
                {headerTitle}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {result.total} {result.total === 1 ? "piece" : "pieces"} ·
                Handcrafted in Accra
              </p>
            </div>
            <div className="flex items-center gap-2">
              <SortSelect current={query.sort ?? "newest"} />
              {/* Mobile filter trigger */}
              <ShopFiltersSheet facets={result.facets} />
            </div>
          </div>

          {/* Search bar */}
          <ShopSearchForm defaultValue={query.search ?? ""} />
        </div>
      </section>

      <Separator />

      {/* Main grid + sidebar */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 lg:gap-10">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1 pb-8">
              <div className="flex items-center gap-2 mb-5">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-serif text-lg font-semibold">Filters</h2>
              </div>
              <ShopFilters
                facets={result.facets}
                allCategories={allCategoryValues}
              />
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {result.products.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                  {result.products.map((p, i) => (
                    <ProductCard key={p.id} product={p} priority={i < 4} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-10">
                    <ShopPagination current={currentPage} total={totalPages} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

function collectAttributes(
  sp: Record<string, string | string[] | undefined>
): Record<string, string[]> | undefined {
  const out: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(sp)) {
    if (!key.startsWith("attr_")) continue;
    const name = decodeURIComponent(key.slice(5));
    const values = arr(value);
    if (values.length) out[name] = values;
  }
  return Object.keys(out).length ? out : undefined;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4">
      <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <PackageSearch className="h-7 w-7" />
      </div>
      <h2 className="font-serif text-2xl font-semibold mb-2">
        No pieces match your filters
      </h2>
      <p className="text-muted-foreground max-w-md mb-6">
        Try widening your selection or clearing filters. Our atelier adds new
        pieces every month - check back soon.
      </p>
      <Button asChild>
        <Link href="/shop">View all jewelry</Link>
      </Button>
    </div>
  );
}

/**
 * Search form - server-rendered with method=get so it submits as a normal
 * navigation. The browser merges the q= param with the action URL.
 */
function ShopSearchForm({ defaultValue }: { defaultValue: string }) {
  return (
    <form action="/shop" method="get" role="search" className="relative max-w-xl">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search rings, earrings, materials..."
        className="pl-9 pr-24 h-10"
        aria-label="Search products"
      />
      <Button
        type="submit"
        size="sm"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7"
      >
        Search
      </Button>
    </form>
  );
}
