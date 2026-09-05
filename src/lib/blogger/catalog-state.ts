import type { Product } from "./types";

/**
 * Compatibility helpers for routes that need a catalog snapshot. Product
 * state is never persisted here: Blogger is the only catalog source of truth.
 */
export function getPublishedProducts(): Product[] { return []; }
export function getAllProducts(): Product[] { return []; }
export function getWorkingCatalog(): Product[] { return []; }
