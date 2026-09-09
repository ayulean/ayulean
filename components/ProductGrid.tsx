import ProductCard from "./ProductCard";
import type { Product } from "@/lib/types";

/**
 * Column counts matched to how many products there actually are.
 *
 * A four-column grid holding one product leaves three empty columns and makes
 * the shop look unfinished, so a short catalogue gets a narrower, centred grid
 * instead. The classes are written out in full because Tailwind reads them
 * from the source.
 */
function layoutFor(count: number) {
  if (count <= 1) return "mx-auto max-w-xs";
  if (count === 2) return "mx-auto max-w-2xl sm:grid-cols-2";
  if (count === 3) return "sm:grid-cols-2 lg:grid-cols-3";
  return "sm:grid-cols-2 lg:grid-cols-4";
}

export function ProductGrid({
  products,
  className = "",
}: {
  products: Product[];
  className?: string;
}) {
  return (
    <div className={`grid gap-5 ${layoutFor(products.length)} ${className}`}>
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} index={i} />
      ))}
    </div>
  );
}

export default ProductGrid;
