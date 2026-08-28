import { ProductVisual } from "@/components/store/ProductVisual";
import { useCart } from "@/components/store/CartProvider";
import { StoreShell } from "@/components/store/StoreShell";
import { trpc } from "@/lib/trpc";
import type { CatalogProduct } from "@shared/catalog";
import { ChevronDown, Search, ShoppingBag, SlidersHorizontal, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";

type SortOption = "Newest" | "Price: low to high" | "Price: high to low";

function ProductCard({ product }: { product: CatalogProduct }) {
  const { addItem } = useCart();
  const property = product.attributes[0];

  return (
    <article className="product-card">
      <Link href={`/shop/${product.slug}`} className="product-image-wrap">
        <ProductVisual image={product.images[0]} name={product.name} />
        {product.badges[0] && <span className="product-badge">{product.badges[0]}</span>}
      </Link>
      <div className="product-card-info">
        <div>
          <p className="product-category">{product.category} · {product.collection}</p>
          <Link href={`/shop/${product.slug}`} className="product-name">{product.name}</Link>
        </div>
        <p className="product-price">{new Intl.NumberFormat(undefined, { style: "currency", currency: product.currency }).format(product.price)}</p>
      </div>
      <div className="product-card-detail">
        <span>{product.materials[0]}</span>
        {property && <span>{property.name}: {property.values.join(", ")}</span>}
      </div>
      <button className="card-add" onClick={() => addItem(product)} disabled={product.availability === "out-of-stock"}>
        <ShoppingBag size={15} /> {product.availability === "out-of-stock" ? "Unavailable" : "Add to bag"}
      </button>
    </article>
  );
}

export default function Shop() {
  const { data, isLoading } = trpc.catalog.list.useQuery(undefined, { staleTime: 10_000, refetchInterval: 15_000, retry: 1 });
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1]);
  const queryBadge = searchParams.get("badge");
  const searchFromLocation = searchParams.get("search") ?? "";
  const categoryFromLocation = searchParams.get("category") ?? "All";
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [collection, setCollection] = useState("All");
  const [material, setMaterial] = useState("All");
  const [availability, setAvailability] = useState("All");
  const [attributeFilters, setAttributeFilters] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<SortOption>("Newest");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => { setQuery(searchFromLocation); }, [searchFromLocation]);
  useEffect(() => { setCategory(categoryFromLocation); }, [categoryFromLocation]);

  const products = data?.products ?? [];
  const attributeFacets = Object.entries(data?.facets.attributes ?? {});
  const resetFilters = () => {
    setCategory("All");
    setCollection("All");
    setMaterial("All");
    setAvailability("All");
    setAttributeFilters({});
    setQuery("");
    setSort("Newest");
  };

  const filtered = useMemo(() => {
    const expectedBadge = queryBadge === "new" ? "New arrival" : "";
    const matches = products.filter(product => {
      const customValues = product.attributes.flatMap(attribute => [attribute.name, ...attribute.values]).join(" ");
      const searchable = `${product.name} ${product.description} ${product.category} ${product.collection} ${product.materials.join(" ")} ${customValues}`.toLowerCase();
      const matchesAttributes = Object.entries(attributeFilters).every(([name, value]) => !value || product.attributes.some(attribute => attribute.name === name && attribute.values.includes(value)));

      return (!query || searchable.includes(query.toLowerCase()))
        && (category === "All" || product.category === category)
        && (collection === "All" || product.collection === collection)
        && (material === "All" || product.materials.includes(material))
        && (availability === "All" || product.availability === availability)
        && matchesAttributes
        && (!expectedBadge || product.badges.includes(expectedBadge));
    });

    return [...matches].sort((left, right) => {
      if (sort === "Price: low to high") return left.price - right.price;
      if (sort === "Price: high to low") return right.price - left.price;
      return Date.parse(right.publishedAt) - Date.parse(left.publishedAt);
    });
  }, [products, query, category, collection, material, availability, attributeFilters, queryBadge, sort]);

  const activeFilterCount = [category, collection, material, availability, ...Object.values(attributeFilters)].filter(value => value !== "All" && value !== "").length;

  return (
    <StoreShell>
      <main className="shop-page marketplace-shop-page">
        <section className="shop-intro">
          <p className="eyebrow">Direct jewelry store</p>
          <h1>Shop the <i>La Glitz edit.</i></h1>
          <p>Search, compare, and add published pieces to your bag in one clear shopping flow. Every product comes directly from the La Glitz catalog.</p>
          <div className="department-rail" aria-label="Jewelry departments">
            <span>Shop by type</span>
            {data?.facets.categories.length ? data.facets.categories.map(value => <button key={value} className={category === value ? "is-selected" : ""} onClick={() => setCategory(value)}>{value}</button>) : ["Rings", "Earrings", "Necklaces", "Bracelets"].map(value => <button key={value} onClick={() => setCategory(value)}>{value}</button>)}
          </div>
        </section>
        <section className="catalog-section">
          <div className="catalog-toolbar">
            <div className="search-box"><Search size={17} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search name, material, gemstone, size…" aria-label="Search the La Glitz store" /></div>
            <div className="catalog-actions">
              <label className="sort-control">Sort<select aria-label="Sort products" value={sort} onChange={event => setSort(event.target.value as SortOption)}><option>Newest</option><option>Price: low to high</option><option>Price: high to low</option></select><ChevronDown size={15} /></label>
              <button className="filter-button" onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={16} /> Filters {activeFilterCount ? `(${activeFilterCount})` : ""}</button>
            </div>
          </div>
          <div className={`filters-row ${filtersOpen ? "is-open" : ""}`}>
            <label>Category<select value={category} onChange={event => setCategory(event.target.value)}><option>All</option>{data?.facets.categories.map(value => <option key={value}>{value}</option>)}</select><ChevronDown size={15} /></label>
            <label>Collection<select value={collection} onChange={event => setCollection(event.target.value)}><option>All</option>{data?.facets.collections.map(value => <option key={value}>{value}</option>)}</select><ChevronDown size={15} /></label>
            <label>Material<select value={material} onChange={event => setMaterial(event.target.value)}><option>All</option>{data?.facets.materials.map(value => <option key={value}>{value}</option>)}</select><ChevronDown size={15} /></label>
            <label>Availability<select value={availability} onChange={event => setAvailability(event.target.value)}><option>All</option>{data?.facets.availability.map(value => <option key={value} value={value}>{value.replace("-", " ")}</option>)}</select><ChevronDown size={15} /></label>
            {attributeFacets.map(([name, values]) => <label key={name}>{name}<select value={attributeFilters[name] ?? ""} onChange={event => setAttributeFilters(current => ({ ...current, [name]: event.target.value }))}><option value="">All</option>{values.map(value => <option key={value}>{value}</option>)}</select><ChevronDown size={15} /></label>)}
            {(activeFilterCount > 0 || query) && <button className="clear-filters" onClick={resetFilters}><X size={14} /> Reset</button>}
          </div>
          {isLoading ? <div className="catalog-loading"><span /><span /><span /></div> : products.length === 0 ? <EmptyCatalog /> : filtered.length === 0 ? <div className="no-results"><p className="eyebrow">No matching pieces</p><h2>Try another <i>search.</i></h2><p>Adjust the filters or search by a product name, material, gemstone, size, or collection.</p><button className="text-link" onClick={resetFilters}>Clear all filters</button></div> : <><div className="catalog-count"><b>{filtered.length}</b> {filtered.length === 1 ? "piece available" : "pieces available"}<span>Updated directly from the La Glitz catalog</span></div><div className="product-grid">{filtered.map(product => <ProductCard key={product.id} product={product} />)}</div></>}
        </section>
      </main>
    </StoreShell>
  );
}

export function EmptyCatalog() {
  return <section className="empty-catalog"><div className="empty-sigil"><span /><span /><span /></div><p className="eyebrow">Store opening soon</p><h2>No pieces are<br /><i>available today.</i></h2><p>New La Glitz products appear here automatically as soon as they are published to the catalog.</p><Link href="/" className="primary-link">Return to store home</Link><p className="catalog-note">The product catalog is currently empty.</p></section>;
}
