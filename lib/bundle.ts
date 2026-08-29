import type { BundleComponent, ProductRow } from "./types";

/**
 * How many of a combo can be sold, given what its components have in stock.
 * A combo has no stock of its own — selling one takes units out of each part.
 */
export function bundleAvailability(components: Array<{ qty: number; stock: number }>): number {
  if (components.length === 0) return 0;
  return components.reduce((min, c) => Math.min(min, Math.floor(c.stock / Math.max(1, c.qty))), Infinity);
}

/** What the same items would cost if bought separately, at their own prices. */
export function bundleSeparateValue(components: Array<{ qty: number; price: number }>): number {
  return components.reduce((sum, c) => sum + c.price * c.qty, 0);
}

/** Normalises the raw jsonb into a clean, de-duplicated component list. */
export function parseBundleItems(value: unknown): BundleComponent[] {
  if (!Array.isArray(value)) return [];

  const byProduct = new Map<number, number>();
  for (const raw of value) {
    if (typeof raw !== "object" || raw === null) continue;
    const productId = Number((raw as BundleComponent).productId);
    const qty = Math.floor(Number((raw as BundleComponent).qty));
    if (!Number.isInteger(productId) || productId <= 0) continue;
    if (!Number.isInteger(qty) || qty <= 0) continue;
    byProduct.set(productId, (byProduct.get(productId) ?? 0) + Math.min(qty, 50));
  }

  return [...byProduct].map(([productId, qty]) => ({ productId, qty: Math.min(qty, 50) }));
}

export function isBundleRow(row: Pick<ProductRow, "bundle_items">): boolean {
  return Array.isArray(row.bundle_items) && row.bundle_items.length > 0;
}
