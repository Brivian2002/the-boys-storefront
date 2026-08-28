import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("wouter", () => ({
  Link: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => <a href={href} className={className}>{children}</a>,
  useRoute: () => [true, { slug: "solstice-pendant-ring-1" }],
  useLocation: () => ["/shop/solstice-pendant-ring-1", () => undefined],
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
          data: { products: [{ id: "ring-1", slug: "solstice-pendant-ring-1", name: "Solstice Pendant", description: "A polished pendant.", price: 30000, currency: "NGN", category: "Necklaces", collection: "Solstice", materials: ["18k Gold"], availability: "in-stock", images: [], badges: [], publishedAt: "2026-08-28T00:00:00Z" }], facets: { categories: [], collections: [], materials: [], availability: [] } },
        }),
      },
    },
  },
}));

import ProductDetail from "./ProductDetail";

describe("Paystack product checkout", () => {
  it("renders an add-to-bag action for a qualifying Blogger product", () => {
    const markup = renderToStaticMarkup(<ProductDetail />);
    expect(markup).toContain("Add to bag");
    expect(markup).not.toContain("selar.co");
  });
});
