"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { money } from "@/lib/pricing";
import { trackAddToCart, trackBeginCheckout } from "@/lib/track";
import type { Product } from "@/lib/types";
import { useCart } from "./CartProvider";

export function AddToCart({ product }: { product: Product }) {
  const { add } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const out = product.available <= 0;

  // Once the real buttons scroll away, a compact bar takes over at the bottom
  // of the screen so ordering is always one tap away on a phone.
  const anchor = useRef<HTMLDivElement>(null);
  const [showBar, setShowBar] = useState(false);
  useEffect(() => {
    const el = anchor.current;
    if (!el || out) return;
    const io = new IntersectionObserver(([entry]) => setShowBar(!entry.isIntersecting), {
      rootMargin: "0px 0px -80px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [out]);

  const payload = {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    image: product.image,
    price: product.price,
    mrp: product.mrp,
  };

  const addToCart = () => {
    add(payload, qty);
    trackAddToCart(payload, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const buyNow = () => {
    add(payload, qty);
    trackAddToCart(payload, qty);
    trackBeginCheckout([{ ...payload, qty }], payload.price * qty);
    router.push("/checkout");
  };

  const stepper = (
    <div className="inline-flex items-center rounded-full border border-brand-200 transition-colors focus-within:border-brand-400">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => setQty((q) => Math.max(1, q - 1))}
        className="h-11 w-11 rounded-l-full text-lg font-bold text-brand-700 transition-colors hover:bg-brand-50 active:bg-brand-100"
      >
        −
      </button>
      {/* Re-keyed on every change so the new number counts in. */}
      <span key={qty} className="anim-scale-in w-10 text-center font-semibold" aria-live="polite">
        {qty}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => setQty((q) => Math.min(Math.min(10, product.available), q + 1))}
        className="h-11 w-11 rounded-r-full text-lg font-bold text-brand-700 transition-colors hover:bg-brand-50 active:bg-brand-100"
      >
        +
      </button>
    </div>
  );

  return (
    <div className="mt-6" ref={anchor}>
      <div className="flex flex-wrap items-center gap-4">
        {stepper}
        <span className="text-sm text-ink/60">
          {out
            ? "Currently out of stock"
            : product.isBundle
              ? `${product.available} combo${product.available === 1 ? "" : "s"} available`
              : `${product.available} in stock`}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={out}
          onClick={addToCart}
          className={`flex-1 overflow-hidden rounded-full border-2 px-6 py-3.5 font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40 ${
            added
              ? "border-brand-600 bg-brand-600 text-white"
              : "border-brand-600 text-brand-700 hover:-translate-y-0.5 hover:bg-brand-50 hover:shadow-md"
          }`}
        >
          <span key={added ? "yes" : "no"} className="anim-fade-in inline-block">
            {added ? "✓ Added to cart" : "Add to Cart"}
          </span>
        </button>
        <button
          type="button"
          disabled={out}
          onClick={buyNow}
          className="flex-1 rounded-full bg-brand-600 px-6 py-3.5 font-semibold text-white shadow-md shadow-brand-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
        >
          Buy Now
        </button>
      </div>

      {showBar && (
        <div className="anim-fade-up fixed inset-x-0 bottom-0 z-40 border-t border-brand-100 bg-white/95 p-3 shadow-[0_-4px_20px_rgba(27,35,24,0.08)] backdrop-blur lg:hidden print:hidden">
          <div className="container-x flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-brand-800">{product.name}</p>
              <p className="text-lg font-bold leading-tight text-brand-700">{money(product.price)}</p>
            </div>
            <button
              type="button"
              onClick={addToCart}
              className="shrink-0 rounded-full border-2 border-brand-600 px-4 py-2.5 text-sm font-semibold text-brand-700"
            >
              {added ? "✓" : "Add"}
            </button>
            <button
              type="button"
              onClick={buyNow}
              className="shrink-0 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Buy Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddToCart;
