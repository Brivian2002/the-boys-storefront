import { useCart } from "@/components/store/CartProvider";
import { StoreShell } from "@/components/store/StoreShell";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import React, { useEffect } from "react";
import { Link, useLocation } from "wouter";

export default function PaymentVerification() {
  const [location] = useLocation();
  const reference = new URLSearchParams(location.split("?")[1] ?? "").get("reference") ?? "";
  const { clearCart } = useCart();
  const result = trpc.checkout.verify.useQuery({ reference }, { enabled: Boolean(reference), retry: 1 });
  useEffect(() => { if (result.data?.success) clearCart(); }, [result.data?.success, clearCart]);
  const state = result.isLoading ? "loading" : result.data?.success ? "success" : "pending";
  return <StoreShell><main className="payment-page"><section className={`payment-card payment-${state}`}>{state === "loading" ? <><Clock3 size={30} /><p className="eyebrow">Confirming payment</p><h1>One <i>moment.</i></h1><p>We are confirming your Paystack payment securely.</p></> : state === "success" ? <><CheckCircle2 size={30} /><p className="eyebrow">Payment received</p><h1>Thank you for<br /><i>your order.</i></h1><p>Your payment has been confirmed. Keep your Paystack reference for delivery support.</p><Link href="/shop" className="primary-link">Return to the collection</Link></> : <><XCircle size={30} /><p className="eyebrow">Payment pending</p><h1>We could not <i>confirm</i> payment.</h1><p>Use your Paystack reference to check the transaction, then contact La Glitz if you need help.</p><Link href="/contact" className="primary-link">Contact La Glitz</Link></>}</section></main></StoreShell>;
}
