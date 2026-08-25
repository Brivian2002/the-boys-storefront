import { useCart } from "@/components/store/CartProvider";
import { StoreShell } from "@/components/store/StoreShell";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

const initialForm = { email: "", name: "", phone: "", address: "", city: "" };

export default function Checkout() {
  const { items } = useCart();
  const [form, setForm] = useState(initialForm);
  const initialize = trpc.checkout.initialize.useMutation();
  const currency = items[0]?.currency ?? "NGN";
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const formatted = new Intl.NumberFormat(undefined, { style: "currency", currency }).format(total);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!items.length) return;
    try {
      const session = await initialize.mutateAsync({ lines: items.map(item => ({ id: item.id, quantity: item.quantity })), contact: form });
      window.location.assign(session.authorizationUrl);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to begin secure checkout.");
    }
  };
  return <StoreShell><main className="checkout-page"><Link className="back-link" href="/cart"><ArrowLeft size={16} /> Shopping bag</Link><div className="checkout-layout"><form className="checkout-form" onSubmit={submit}><p className="eyebrow">Secure checkout</p><h1>A few final <i>details.</i></h1><p className="checkout-intro">Your information is sent to our server only to prepare a hosted Paystack payment session and delivery details.</p><div className="checkout-fields"><label>Email address<input required type="email" autoComplete="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} /></label><label>Full name<input required autoComplete="name" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} /></label><label>Phone number<input required autoComplete="tel" value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })} /></label><label>City / area<input required autoComplete="address-level2" value={form.city} onChange={event => setForm({ ...form, city: event.target.value })} /></label><label className="field-full">Delivery address<textarea required autoComplete="street-address" value={form.address} onChange={event => setForm({ ...form, address: event.target.value })} /></label></div><button className="paystack-button" disabled={!items.length || initialize.isPending}><LockKeyhole size={16} /> {initialize.isPending ? "Preparing secure payment…" : `Continue to Paystack · ${formatted}`}</button><p className="secure-note"><LockKeyhole size={13} /> Payment is completed on Paystack’s secure hosted checkout.</p></form><aside className="checkout-summary"><p className="eyebrow">Your order</p>{items.map(item => <div className="checkout-line" key={item.id}><span>{item.name} <small>× {item.quantity}</small></span><b>{new Intl.NumberFormat(undefined, { style: "currency", currency: item.currency }).format(item.price * item.quantity)}</b></div>)}<div className="checkout-total"><span>Total</span><b>{formatted}</b></div><Link href="/delivery">Review delivery information</Link></aside></div></main></StoreShell>;
}
