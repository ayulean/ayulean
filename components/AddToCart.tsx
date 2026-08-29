"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { trackAddToCart, trackBeginCheckout } from "@/lib/track";
import type { Product } from "@/lib/types";
import { useCart } from "./CartProvider";

export function AddToCart({ product }: { product: Product }) {
  const { add } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const out = product.available <= 0;

  const payload = {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    image: product.image,
    price: product.price,
    mrp: product.mrp,
  };

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="inline-flex items-center rounded-full border border-brand-200">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="h-11 w-11 rounded-l-full text-lg font-bold text-brand-700 hover:bg-brand-50"
          >
            −
          </button>
          <span className="w-10 text-center font-semibold" aria-live="polite">{qty}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => Math.min(Math.min(10, product.available), q + 1))}
            className="h-11 w-11 rounded-r-full text-lg font-bold text-brand-700 hover:bg-brand-50"
          >
            +
          </button>
        </div>
        <span className="text-sm text-ink/60">
          {out
            ? "Currently out of stock"
            : product.isBundle
              ? `${product.available} combos available`
              : `${product.available} in stock`}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={out}
          onClick={() => {
            add(payload, qty);
            trackAddToCart(payload, qty);
            setAdded(true);
            setTimeout(() => setAdded(false), 1800);
          }}
          className="flex-1 rounded-full border-2 border-brand-600 px-6 py-3.5 font-semibold text-brand-700 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {added ? "✓ Added to cart" : "Add to Cart"}
        </button>
        <button
          type="button"
          disabled={out}
          onClick={() => {
            add(payload, qty);
            trackAddToCart(payload, qty);
            trackBeginCheckout([{ ...payload, qty }], payload.price * qty);
            router.push("/checkout");
          }}
          className="flex-1 rounded-full bg-brand-600 px-6 py-3.5 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}

export default AddToCart;
