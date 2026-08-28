import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("wouter", () => ({
  Link: ({ children, href, className, ...props }: { children: React.ReactNode; href: string; className?: string }) => <a href={href} className={className} {...props}>{children}</a>,
  useLocation: () => ["/", vi.fn()],
}));

vi.mock("@/contexts/ThemeContext", () => ({
  useTheme: () => ({ theme: "light", toggleTheme: vi.fn() }),
}));

vi.mock("@/components/store/CartProvider", () => ({
  useCart: () => ({ itemCount: 0 }),
}));

import { StoreShell } from "./StoreShell";

describe("private store management indicator", () => {
  it("uses an accessible, compact indicator that points to the protected atelier route", () => {
    const markup = renderToStaticMarkup(<StoreShell><main>Storefront content</main></StoreShell>);

    expect(markup).toContain('href="/atelier"');
    expect(markup).toContain('aria-label="Open private store management"');
    expect(markup).not.toContain(">Store management<");
  });
});
