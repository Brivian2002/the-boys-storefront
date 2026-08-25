import { useCart } from "@/components/store/CartProvider";
import { StoreShell } from "@/components/store/StoreShell";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "wouter";

export default function PaymentVerification() {
  const [location] = useLocation();
  const reference = new URLSearchParams(location.split("?")[1]).get("reference") ?? "";
  const { clearCart } = useCart();
  const verification = trpc.checkout.verify.useQuery({ reference }, { enabled: Boolean(reference), retry: 1 });
  const success = verification.data?.status === "success";
  useEffect(() => { if (success) clearCart(); }, [success, clearCart]);
  const state = !reference || verification.isLoading ? "loading" : success ? "success" : "pending";
  return <StoreShell><main className="payment-result"><div className={`payment-seal ${state}`}>{state === "loading" ? <LoaderCircle className="spin" size={32} /> : state === "success" ? <CheckCircle2 size={34} /> : <CircleAlert size={34} />}</div>{state === "loading" ? <><p className="eyebrow">Confirming your transaction</p><h1>A moment of <i>care.</i></h1><p>We are securely confirming your payment with Paystack.</p></> : state === "success" ? <><p className="eyebrow">Payment confirmed</p><h1>Thank you for<br /><i>choosing La Glitz.</i></h1><p>Your payment has been verified. We will use the delivery details supplied at checkout to prepare your order.</p><p className="payment-reference">Reference · {verification.data?.reference}</p><Link href="/shop" className="primary-link">Return to the collection</Link></> : <><p className="eyebrow">Payment not yet confirmed</p><h1>Your piece is<br /><i>still waiting.</i></h1><p>Paystack has not confirmed a successful payment for this reference. You can return to your bag or contact us if you need assistance.</p><Link href="/cart" className="primary-link">Return to your bag</Link></>}</main></StoreShell>;
}
