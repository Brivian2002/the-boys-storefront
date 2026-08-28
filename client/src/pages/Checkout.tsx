import { useCart } from "@/components/store/CartProvider";
import { StoreShell } from "@/components/store/StoreShell";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import React, { FormEvent, useState } from "react";
import { Link } from "wouter";

export function redirectToPaystack(authorizationUrl: string) {
  window.location.assign(authorizationUrl);
}

export default function Checkout() {
  const { items } = useCart();
  const [form, setForm] = useState({ email: "", name: "", phone: "", address: "", city: "" });
  const initialize = trpc.checkout.initialize.useMutation({ onSuccess: data => redirectToPaystack(data.authorizationUrl) });
  const submit = (event: FormEvent) => { event.preventDefault(); initialize.mutate({ lines: items.map(item => ({ id: item.id, quantity: item.quantity })), contact: form }); };
  if (!items.length) return <StoreShell><main className="checkout-page"><p className="eyebrow">Secure checkout</p><h1>Your bag is <i>waiting.</i></h1><p className="checkout-intro">Add a piece before continuing to secure payment.</p><Link href="/shop" className="primary-link">Explore the collection</Link></main></StoreShell>;
  return <StoreShell><main className="checkout-page"><Link href="/cart" className="back-link"><ArrowLeft size={16} /> Bag</Link><div className="checkout-grid"><form className="checkout-form" onSubmit={submit}><p className="eyebrow">Secure checkout</p><h1>Delivery, then <i>payment.</i></h1><p className="checkout-intro">Your details are used to prepare your order. Payment is completed on Paystack’s hosted checkout.</p><div className="checkout-fields"><label>Email<input required type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} /></label><label>Full name<input required minLength={2} value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} /></label><label>Phone<input required minLength={6} value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })} /></label><label>City<input required minLength={2} value={form.city} onChange={event => setForm({ ...form, city: event.target.value })} /></label><label className="field-full">Delivery address<textarea required minLength={8} value={form.address} onChange={event => setForm({ ...form, address: event.target.value })} /></label></div>{initialize.error && <p className="form-error">{initialize.error.message}</p>}<button className="paystack-button" disabled={initialize.isPending}>{initialize.isPending ? "Preparing secure payment…" : <><LockKeyhole size={16} /> Continue to Paystack</>}</button><p className="secure-note"><LockKeyhole size={13} /> Card and payment information are handled securely by Paystack.</p></form><CheckoutSummary items={items} /></div></main></StoreShell>;
}

function CheckoutSummary({ items }: { items: ReturnType<typeof useCart>["items"] }) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const currency = items[0]?.currency ?? "USD";
  return <aside className="checkout-summary"><p className="eyebrow">Order summary</p>{items.map(item => <div className="checkout-line" key={item.id}><span>{item.name}<small> × {item.quantity}</small></span><b>{new Intl.NumberFormat(undefined, { style: "currency", currency }).format(item.price * item.quantity)}</b></div>)}<div className="checkout-total"><span>Total</span><b>{new Intl.NumberFormat(undefined, { style: "currency", currency }).format(total)}</b></div></aside>;
}
