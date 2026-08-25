import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("wouter", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
  useLocation: () => ["/", () => undefined],
  useRoute: () => [false, undefined],
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    catalog: {
      list: {
        useQuery: () => ({
          data: { products: [], facets: { categories: [], collections: [], materials: [], availability: [] } },
          isLoading: false,
        }),
      },
    },
  },
}));

vi.mock("@/components/store/CartProvider", () => ({
  useCart: () => ({ itemCount: 0, addItem: vi.fn(), items: [], updateQuantity: vi.fn(), removeItem: vi.fn() }),
}));

import Shop from "./Shop";

describe("empty catalog experience", () => {
  it("welcomes shoppers without inventing any unpublished products", () => {
    const markup = renderToStaticMarkup(<Shop />);

    expect(markup).toContain("The atelier is preparing");
    expect(markup).toContain("Our collection is");
    expect(markup).toContain("Return to the house");
    expect(markup).toContain("No products are displayed until a qualifying piece is published.");
  });
});
