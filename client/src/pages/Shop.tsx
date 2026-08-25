import { useCart } from "@/components/store/CartProvider";
import { ProductVisual } from "@/components/store/ProductVisual";
import { StoreShell } from "@/components/store/StoreShell";
import { trpc } from "@/lib/trpc";
import type { CatalogProduct } from "@shared/catalog";
import { ChevronDown, Search, ShoppingBag, SlidersHorizontal, X } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";

function ProductCard({ product }: { product: CatalogProduct }) {
  const { addItem } = useCart();
  return <article className="product-card">
    <Link href={`/shop/${product.slug}`} className="product-image-wrap"><ProductVisual image={product.images[0]} name={product.name} />{product.badges[0] && <span className="product-badge">{product.badges[0]}</span>}</Link>
    <div className="product-card-info"><div><p className="product-category">{product.category}</p><Link href={`/shop/${product.slug}`} className="product-name">{product.name}</Link></div><p className="product-price">{new Intl.NumberFormat(undefined, { style: "currency", currency: product.currency }).format(product.price)}</p></div>
    <button className="card-add" onClick={() => addItem(product)} disabled={product.availability === "out-of-stock"}><ShoppingBag size={15} /> {product.availability === "out-of-stock" ? "Unavailable" : "Add to bag"}</button>
  </article>;
}

export default function Shop() {
  const { data, isLoading } = trpc.catalog.list.useQuery(undefined, { staleTime: 60_000, retry: 1 });
  const [location] = useLocation();
  const queryBadge = new URLSearchParams(location.split("?")[1]).get("badge");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [collection, setCollection] = useState("All");
  const [material, setMaterial] = useState("All");
  const [availability, setAvailability] = useState("All");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const products = data?.products ?? [];
  const filtered = useMemo(() => products.filter(product => {
    const searchable = `${product.name} ${product.description} ${product.category} ${product.collection} ${product.materials.join(" ")}`.toLowerCase();
    const expectedBadge = queryBadge === "new" ? "New arrival" : "";
    return (!query || searchable.includes(query.toLowerCase())) && (category === "All" || product.category === category) && (collection === "All" || product.collection === collection) && (material === "All" || product.materials.includes(material)) && (availability === "All" || product.availability === availability) && (!expectedBadge || product.badges.includes(expectedBadge));
  }), [products, query, category, collection, material, availability, queryBadge]);
  const activeFilterCount = [category, collection, material, availability].filter(value => value !== "All").length;

  return <StoreShell><main className="shop-page"><section className="shop-intro"><p className="eyebrow">The collection</p><h1>Find your <i>forever piece.</i></h1><p>Every published piece is selected, categorized, and presented here with intention.</p></section>
    <section className="catalog-section">
      <div className="catalog-toolbar"><div className="search-box"><Search size={17} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search the collection" aria-label="Search the collection" /></div><button className="filter-button" onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={16} /> Filters {activeFilterCount ? `(${activeFilterCount})` : ""}</button></div>
      <div className={`filters-row ${filtersOpen ? "is-open" : ""}`}><label>Category<select value={category} onChange={event => setCategory(event.target.value)}><option>All</option>{data?.facets.categories.map(value => <option key={value}>{value}</option>)}</select><ChevronDown size={15} /></label><label>Collection<select value={collection} onChange={event => setCollection(event.target.value)}><option>All</option>{data?.facets.collections.map(value => <option key={value}>{value}</option>)}</select><ChevronDown size={15} /></label><label>Material<select value={material} onChange={event => setMaterial(event.target.value)}><option>All</option>{data?.facets.materials.map(value => <option key={value}>{value}</option>)}</select><ChevronDown size={15} /></label><label>Availability<select value={availability} onChange={event => setAvailability(event.target.value)}><option>All</option>{data?.facets.availability.map(value => <option key={value} value={value}>{value.replace("-", " ")}</option>)}</select><ChevronDown size={15} /></label>{(activeFilterCount > 0 || query) && <button className="clear-filters" onClick={() => { setCategory("All"); setCollection("All"); setMaterial("All"); setAvailability("All"); setQuery(""); }}><X size={14} /> Reset</button>}</div>
      {isLoading ? <div className="catalog-loading"><span /><span /><span /></div> : products.length === 0 ? <EmptyCatalog /> : filtered.length === 0 ? <div className="no-results"><p className="eyebrow">No matches found</p><h2>Try a different <i>search.</i></h2><button className="text-link" onClick={() => { setCategory("All"); setCollection("All"); setMaterial("All"); setAvailability("All"); setQuery(""); }}>Clear all filters</button></div> : <><div className="catalog-count">{filtered.length} {filtered.length === 1 ? "piece" : "pieces"}</div><div className="product-grid">{filtered.map(product => <ProductCard key={product.id} product={product} />)}</div></>}
    </section>
  </main></StoreShell>;
}

export function EmptyCatalog() {
  return <section className="empty-catalog"><div className="empty-sigil"><span /><span /><span /></div><p className="eyebrow">The atelier is preparing</p><h2>Our collection is<br /><i>coming into focus.</i></h2><p>The first La Glitz pieces will appear here as they are released. Please return soon to discover something made to be kept.</p><Link href="/" className="primary-link">Return to the house</Link><p className="catalog-note">No products are displayed until a qualifying piece is published.</p></section>;
}
