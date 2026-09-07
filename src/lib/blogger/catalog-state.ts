/**
 * Shared mutable catalog state.
 *
 * Both the public catalog reader (client.ts) and the admin mutation
 * layer (admin-store.ts) read from / write to this single in-memory
 * catalog. We store it on `globalThis` so it survives module re-
 * evaluation in Next.js dev mode (Turbopack can give different route
 * bundles separate module instances; globalThis is process-wide).
 *
 * In production, both layers read from Blogger via the API.
 */

import { MOCK_PRODUCTS } from "./mock-catalog";
import type { Product } from "./types";

const GLOBAL_KEY = "__LA_GLITZ_CATALOG__";

interface GlobalStore {
  workingCatalog: Product[];
}

function getStore(): GlobalStore {
  const g = globalThis as unknown as Record<string, unknown>;
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = {
      workingCatalog: MOCK_PRODUCTS.map((p) => ({ ...p })),
    };
  }
  return g[GLOBAL_KEY] as GlobalStore;
}

/**
 * Read a snapshot of published products (for the public storefront).
 */
export function getPublishedProducts(): Product[] {
  return getStore().workingCatalog.filter((p) => p.status === "published");
}

/**
 * Read a snapshot of all products (for the admin dashboard).
 */
export function getAllProducts(): Product[] {
  return getStore().workingCatalog;
}

/**
 * Direct access to the underlying mutable array. Use for mutations
 * (push/unshift/splice). Always returns the same array reference.
 */
export function getWorkingCatalog(): Product[] {
  return getStore().workingCatalog;
}
