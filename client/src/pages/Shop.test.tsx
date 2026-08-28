import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("wouter", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
  useLocation: () => ["/", () => undefined],
  useRoute: () => [false, undefined],
}));

vi.mock("@/contexts/ThemeContext", () => ({
  useTheme: () => ({ theme: "light", toggleTheme: vi.fn(), switchable: true }),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    catalog: {
      list: {
        useQuery: () => ({
          data: { products: [], facets: { categories: [], collections: [], materials: [], availability: [], attributes: {} } },
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

    expect(markup).toContain("Store opening soon");
    expect(markup).toContain("No pieces are");
    expect(markup).toContain("Return to store home");
    expect(markup).toContain("The product catalog is currently empty.");
  });
});
