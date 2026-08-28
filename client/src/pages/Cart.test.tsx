import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("wouter", () => ({ Link: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => <a href={href} className={className}>{children}</a>, useLocation: () => ["/cart", () => undefined] }));
vi.mock("@/contexts/ThemeContext", () => ({ useTheme: () => ({ theme: "light", toggleTheme: vi.fn(), switchable: true }) }));
vi.mock("@/components/store/ProductVisual", () => ({ ProductVisual: () => <div data-product-visual="true" /> }));
vi.mock("@/components/store/CartProvider", () => ({ useCart: () => ({ itemCount: 1, clearCart: vi.fn(), addItem: vi.fn(), updateQuantity: vi.fn(), removeItem: vi.fn(), items: [{ id: "ring-1", slug: "solstice-ring", name: "Solstice Ring", price: 25000, currency: "NGN", images: [], quantity: 1 }] }) }));

import Cart from "./Cart";

describe("Paystack cart journey", () => {
  it("gives a populated browser bag a secure checkout route", () => {
    const markup = renderToStaticMarkup(<Cart />);
    expect(markup).toContain("Secure checkout");
    expect(markup).toContain('href="/checkout"');
  });
});
