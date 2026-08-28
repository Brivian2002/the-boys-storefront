import { useCart } from "@/components/store/CartProvider";
import { ProductVisual } from "@/components/store/ProductVisual";
import { StoreShell } from "@/components/store/StoreShell";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Check, ShoppingBag } from "lucide-react";
import React from "react";
import { Link, useRoute } from "wouter";

export default function ProductDetail() {
  const [, params] = useRoute("/shop/:slug");
  const { data, isLoading } = trpc.catalog.list.useQuery(undefined, { staleTime: 60_000, retry: 1 });
  const { addItem } = useCart();
  const product = data?.products.find(item => item.slug === params?.slug);
  if (isLoading) return <StoreShell><main className="detail-loading">Preparing the piece…</main></StoreShell>;
  if (!product) return <StoreShell><main className="not-found-piece"><p className="eyebrow">Not currently available</p><h1>This piece is <i>not in the collection.</i></h1><Link href="/shop" className="primary-link">Return to the collection</Link></main></StoreShell>;
  const price = new Intl.NumberFormat(undefined, { style: "currency", currency: product.currency }).format(product.price);
  return <StoreShell><main className="product-detail"><Link className="back-link" href="/shop"><ArrowLeft size={16} /> Collection</Link><div className="detail-grid"><div className="detail-gallery"><ProductVisual image={product.images[0]} name={product.name} />{product.images.slice(1).map(image => <ProductVisual key={image} image={image} name={product.name} />)}</div><section className="detail-copy"><p className="eyebrow">{product.collection} · {product.category}</p><h1>{product.name}</h1><p className="detail-price">{price}</p><div className="detail-rule" /><p className="detail-description">{product.description}</p><div className="detail-meta"><div><span>Materials</span><p>{product.materials.join(" · ")}</p></div><div><span>Availability</span><p>{product.availability === "in-stock" ? "Ready to ship" : product.availability.replace("-", " ")}</p></div></div><button className="detail-add" disabled={product.availability === "out-of-stock"} onClick={() => addItem(product)}><ShoppingBag size={17} /> {product.availability === "out-of-stock" ? "Currently unavailable" : "Add to bag"}</button><p className="detail-assurance"><Check size={15} /> Signature wrapping included</p></section></div></main></StoreShell>;
}
