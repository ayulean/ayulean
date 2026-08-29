"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { useWishlist } from "@/components/WishlistProvider";
import { money } from "@/lib/pricing";

export default function WishlistPage() {
  const { items, ready, remove, clear } = useWishlist();
  const { add } = useCart();

  if (!ready) return <div className="container-x py-24 text-center text-ink/50">Loading…</div>;

  if (items.length === 0) {
    return (
      <div className="container-x py-24 text-center">
        <p className="text-5xl" aria-hidden="true">♡</p>
        <h1 className="mt-4 font-display text-3xl font-bold text-brand-900">Your wishlist is empty</h1>
        <p className="mt-2 text-ink/60">Tap the heart on any product to save it for later.</p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-full bg-brand-600 px-8 py-3.5 font-semibold text-white hover:bg-brand-700"
        >
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container-x py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-brand-900">Wishlist</h1>
        <button type="button" onClick={clear} className="text-sm text-red-600 hover:underline">
          Clear all
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {items.map((i) => (
          <div key={i.productId} className="flex gap-4 rounded-2xl border border-brand-100 p-4">
            <Link href={`/product/${i.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-brand-50">
              <Image src={i.image} alt={i.name} fill sizes="96px" className="object-cover" unoptimized />
            </Link>

            <div className="flex flex-1 flex-col">
              <Link href={`/product/${i.slug}`} className="font-semibold text-brand-800 hover:text-brand-600">
                {i.name}
              </Link>
              <p className="mt-1 text-sm">
                <span className="font-bold text-brand-700">{money(i.price)}</span>
                {i.mrp > i.price && <span className="ml-2 text-ink/40 line-through">{money(i.mrp)}</span>}
              </p>

              <div className="mt-auto flex flex-wrap items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    add({ ...i }, 1);
                    remove(i.productId);
                  }}
                  className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Move to cart
                </button>
                <button
                  type="button"
                  onClick={() => remove(i.productId)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
