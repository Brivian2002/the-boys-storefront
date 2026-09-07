import { PublicShell } from "@/components/public/shell";
import { CheckoutView } from "./checkout-view";

export const metadata = {
  title: "Checkout",
  description:
    "Securely complete your order. Pay with Paystack. Afrocentric Jewelry by LaGlitz.",
};

export default function CheckoutPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <CheckoutView />
      </div>
    </PublicShell>
  );
}
