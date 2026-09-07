/**
 * Mock catalog.
 *
 * EMPTY by design — the owner publishes products via Blogger. When Blogger
 * is not yet configured (local dev / preview), the storefront simply shows
 * an empty catalog state rather than fabricated products.
 */

import type { Product } from "./types";

export const MOCK_PRODUCTS: Product[] = [];
