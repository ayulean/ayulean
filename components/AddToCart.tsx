"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { money } from "@/lib/pricing";
import { trackAddToCart, trackBeginCheckout } from "@/lib/track";
import type { Product } from "@/lib/types";
import Icon from "./Icon";
import { useCart } from "./CartProvider";

export function AddToCart({ product }: { product: Product }) {
  const { add } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const out = product.available <= 0;
  const max = Math.min(10, product.available);

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

  return (
    <div className="mt-6" ref={anchor}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <div className="inline-flex items-center rounded-full border border-line-strong transition-colors focus-within:border-brand-400">
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={qty <= 1}
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-11 w-11 items-center justify-center rounded-l-full text-brand-700 transition-colors hover:bg-brand-50 disabled:opacity-30"
          >
            <Icon name="minus" size={16} />
          </button>
          {/* Re-keyed on every change so the new number counts in. */}
          <span key={qty} className="anim-scale-in w-10 text-center font-semibold tabular-nums" aria-live="polite">
            {qty}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            disabled={qty >= max}
            onClick={() => setQty((q) => Math.min(max, q + 1))}
            className="flex h-11 w-11 items-center justify-center rounded-r-full text-brand-700 transition-colors hover:bg-brand-50 disabled:opacity-30"
          >
            <Icon name="plus" size={16} />
          </button>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 text-sm ${out ? "text-red-600" : "text-ink/55"}`}
        >
          {!out && <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />}
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
          className={`btn btn-lg flex-1 ${added ? "btn-primary" : "btn-secondary"}`}
        >
          <span key={added ? "yes" : "no"} className="anim-fade-in inline-flex items-center gap-2">
            {added && <Icon name="check" size={17} />}
            {added ? "Added to cart" : "Add to cart"}
          </span>
        </button>
        <button type="button" disabled={out} onClick={buyNow} className="btn btn-primary btn-lg flex-1">
          Buy now
        </button>
      </div>

      {showBar && (
        <div className="anim-fade-up fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden print:hidden">
          <div className="container-x flex items-center gap-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.8125rem] font-medium text-ink/60">{product.name}</p>
              <p className="text-lg font-bold leading-tight tracking-tight text-brand-700">
                {money(product.price * qty)}
              </p>
            </div>
            <button
              type="button"
              onClick={addToCart}
              aria-label="Add to cart"
              className="btn btn-secondary btn-sm shrink-0"
            >
              {added ? <Icon name="check" size={16} /> : "Add"}
            </button>
            <button type="button" onClick={buyNow} className="btn btn-primary shrink-0">
              Buy now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddToCart;
