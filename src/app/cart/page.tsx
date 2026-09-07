import { PublicShell } from "@/components/public/shell";
import { CartView } from "./cart-view";

export const metadata = {
  title: "Shopping Bag",
  description:
    "Review the pieces in your bag before checking out. Afrocentric Jewelry by LaGlitz.",
};

export default function CartPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <header className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400 mb-2">
            Your selection
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight">
            Shopping bag
          </h1>
        </header>
        <CartView />
      </div>
    </PublicShell>
  );
}
