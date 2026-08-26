import { useCart } from "@/components/store/CartProvider";
import { ProductVisual } from "@/components/store/ProductVisual";
import { StoreShell } from "@/components/store/StoreShell";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { Link } from "wouter";

export default function Cart() {
  const { items, updateQuantity, removeItem } = useCart();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const currency = items[0]?.currency ?? "USD";
  const formatted = new Intl.NumberFormat(undefined, { style: "currency", currency }).format(subtotal);
  return <StoreShell><main className="cart-page"><p className="eyebrow">Your selection</p><h1>Shopping <i>bag.</i></h1>{items.length === 0 ? <section className="cart-empty"><ShoppingBag size={28} strokeWidth={1} /><h2>Your bag is waiting.</h2><p>As you discover a piece that speaks to you, it will be held here.</p><Link href="/shop" className="primary-link">Explore the collection</Link></section> : <div className="cart-layout"><section className="cart-lines">{items.map(item => <article key={item.id} className="cart-line"><div className="cart-image"><ProductVisual image={item.images[0]} name={item.name} small /></div><div className="cart-line-copy"><Link href={`/shop/${item.slug}`}>{item.name}</Link><p>{new Intl.NumberFormat(undefined, { style: "currency", currency: item.currency }).format(item.price)}</p><div className="quantity-control"><button aria-label="Reduce quantity" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={14} /></button><span>{item.quantity}</span><button aria-label="Increase quantity" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={14} /></button></div></div><button className="line-remove" aria-label={`Remove ${item.name}`} onClick={() => removeItem(item.id)}><X size={17} /></button></article>)}</section><aside className="order-summary"><p className="eyebrow">Your selection</p><div><span>Subtotal</span><b>{formatted}</b></div><p>Your bag keeps a shortlist. To buy, open a published piece and continue to its dedicated Selar checkout, where payment and delivery details are completed securely.</p><Link href="/shop" className="checkout-button">Choose a piece to buy</Link></aside></div>}</main></StoreShell>;
}
