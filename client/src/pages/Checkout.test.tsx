import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mutationHooks = vi.hoisted(() => ({ onSuccess: undefined as undefined | ((data: { authorizationUrl: string }) => void) }));

vi.mock("wouter", () => ({ Link: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => <a href={href} className={className}>{children}</a>, useLocation: () => ["/checkout", () => undefined] }));
vi.mock("@/contexts/ThemeContext", () => ({ useTheme: () => ({ theme: "light", toggleTheme: vi.fn(), switchable: true }) }));
vi.mock("@/components/store/CartProvider", () => ({ useCart: () => ({ itemCount: 1, clearCart: vi.fn(), addItem: vi.fn(), updateQuantity: vi.fn(), removeItem: vi.fn(), items: [{ id: "ring-1", slug: "solstice-ring", name: "Solstice Ring", price: 25000, currency: "NGN", images: [], quantity: 1 }] }) }));
vi.mock("@/lib/trpc", () => ({ trpc: { checkout: { initialize: { useMutation: (options: { onSuccess?: (data: { authorizationUrl: string }) => void }) => { mutationHooks.onSuccess = options.onSuccess; return { mutate: vi.fn(), isPending: false, error: null }; } } } } }));

import Checkout, { redirectToPaystack } from "./Checkout";

const originalWindow = globalThis.window;
afterEach(() => { Object.defineProperty(globalThis, "window", { value: originalWindow, configurable: true }); });

describe("Paystack checkout page", () => {
  it("renders delivery fields and the hosted Paystack CTA for a populated browser bag", () => {
    const markup = renderToStaticMarkup(<Checkout />);
    expect(markup).toContain("Continue to Paystack");
    expect(markup).toContain("Delivery address");
    expect(markup).toContain("Solstice Ring");
  });

  it("redirects shoppers to the authorization URL returned by checkout initialization", () => {
    const assign = vi.fn();
    Object.defineProperty(globalThis, "window", { value: { location: { assign } }, configurable: true });
    renderToStaticMarkup(<Checkout />);
    mutationHooks.onSuccess?.({ authorizationUrl: "https://checkout.paystack.com/authorization-code" });
    expect(assign).toHaveBeenCalledWith("https://checkout.paystack.com/authorization-code");
  });
});
