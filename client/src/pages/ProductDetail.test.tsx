import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("wouter", () => ({
  Link: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => <a href={href} className={className}>{children}</a>,
  useRoute: () => [true, { slug: "solstice-pendant-selar-1" }],
  useLocation: () => ["/shop/solstice-pendant-selar-1", () => undefined],
}));

vi.mock("@/contexts/ThemeContext", () => ({
  useTheme: () => ({ theme: "light", toggleTheme: vi.fn(), switchable: true }),
}));

vi.mock("@/components/store/CartProvider", () => ({
  useCart: () => ({ itemCount: 0, items: [], addItem: vi.fn(), updateQuantity: vi.fn(), removeItem: vi.fn(), clearCart: vi.fn() }),
}));

vi.mock("@/components/store/ProductVisual", () => ({
  ProductVisual: () => <div data-product-visual="true" />,
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    catalog: {
      list: {
        useQuery: () => ({
          isLoading: false,
          data: { products: [{ id: "selar-1", slug: "solstice-pendant-selar-1", name: "Solstice Pendant", description: "A polished pendant.", price: 30000, currency: "NGN", category: "Necklaces", collection: "Solstice", materials: ["18k Gold"], availability: "in-stock", images: [], badges: [], publishedAt: "2026-08-26T00:00:00Z", selarCheckoutUrl: "https://selar.co/solstice-pendant?add_to_cart=1" }], facets: { categories: [], collections: [], materials: [], availability: [] } },
        }),
      },
    },
  },
}));

import ProductDetail from "./ProductDetail";

describe("Selar product checkout", () => {
  it("renders a direct Selar purchase link only for a qualifying product", () => {
    const markup = renderToStaticMarkup(<ProductDetail />);
    expect(markup).toContain("Buy securely with Selar");
    expect(markup).toContain('href="https://selar.co/solstice-pendant?add_to_cart=1"');
    expect(markup).toContain('target="_blank"');
  });
});
