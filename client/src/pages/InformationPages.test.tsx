import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

let activeRoute = "/delivery";

vi.mock("wouter", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
  useRoute: (route: string) => [route === activeRoute, route === activeRoute ? {} : undefined],
  useLocation: () => ["/", () => undefined],
}));

vi.mock("@/contexts/ThemeContext", () => ({
  useTheme: () => ({ theme: "light", toggleTheme: vi.fn(), switchable: true }),
}));

vi.mock("@/components/store/CartProvider", () => ({
  useCart: () => ({ itemCount: 0, addItem: vi.fn(), items: [], updateQuantity: vi.fn(), removeItem: vi.fn(), clearCart: vi.fn() }),
}));

import InformationPages from "./InformationPages";

describe("customer information pages", () => {
  it("renders delivery information without relying on unpublished product data", () => {
    activeRoute = "/delivery";
    const markup = renderToStaticMarkup(<InformationPages />);
    expect(markup).toContain("Every detail");
    expect(markup).toContain("Delivery updates");
  });

  it("renders policy and contact guidance through dedicated routes", () => {
    activeRoute = "/policies";
    expect(renderToStaticMarkup(<InformationPages />)).toContain("Orders and payment");
    activeRoute = "/contact";
    expect(renderToStaticMarkup(<InformationPages />)).toContain("hello@laglitz.com");
  });
});
