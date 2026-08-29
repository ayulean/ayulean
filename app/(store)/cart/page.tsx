"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { money, shippingFor } from "@/lib/pricing";
import { SITE } from "@/lib/site";

export default function CartPage() {
  const { items, subtotal, setQty, remove, ready } = useCart();
  const shipping = shippingFor(subtotal);

  if (!ready) return <div className="container-x py-24 text-center text-ink/50">Loading…</div>;

  if (items.length === 0) {
    return (
      <div className="container-x py-24 text-center">
        <p className="text-5xl" aria-hidden="true">🛒</p>
        <h1 className="mt-4 font-display text-3xl font-bold text-brand-900">Your cart is empty</h1>
        <p className="mt-2 text-ink/60">Let us get your Ayurvedic routine started.</p>
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
      <h1 className="font-display text-3xl font-bold text-brand-900">Shopping Cart</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((i) => (
            <div key={i.productId} className="flex gap-4 rounded-2xl border border-brand-100 p-4">
              <Link href={`/product/${i.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-brand-50">
                <Image src={i.image} alt={i.name} fill sizes="96px" className="object-cover" />
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/product/${i.slug}`} className="font-semibold text-brand-800 hover:text-brand-600">
                    {i.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(i.productId)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>

                <p className="mt-1 text-sm text-ink/60">
                  {money(i.price)}
                  {i.mrp > i.price && <span className="ml-2 line-through text-ink/35">{money(i.mrp)}</span>}
                </p>

                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="inline-flex items-center rounded-full border border-brand-200">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => setQty(i.productId, i.qty - 1)}
                      className="h-9 w-9 rounded-l-full font-bold text-brand-700 hover:bg-brand-50"
                    >
                      −
                    </button>
                    <span className="w-9 text-center text-sm font-semibold">{i.qty}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => setQty(i.productId, Math.min(10, i.qty + 1))}
                      className="h-9 w-9 rounded-r-full font-bold text-brand-700 hover:bg-brand-50"
                    >
                      +
                    </button>
                  </div>
                  <p className="font-bold text-brand-700">{money(i.price * i.qty)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-2xl border border-brand-100 bg-cream p-6">
          <h2 className="font-display text-xl font-bold text-brand-800">Order Summary</h2>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink/60">Subtotal</dt>
              <dd className="font-medium">{money(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/60">Shipping</dt>
              <dd className="font-medium">{shipping === 0 ? "FREE" : money(shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-brand-200 pt-3 text-base">
              <dt className="font-semibold">Total</dt>
              <dd className="font-bold text-brand-700">{money(subtotal + shipping)}</dd>
            </div>
          </dl>

          {shipping > 0 && (
            <p className="mt-3 rounded-lg bg-white p-3 text-xs text-ink/60">
Add {money(SITE.freeShippingAbove - subtotal)} more to get free shipping!
            </p>
          )}

          <Link
            href="/checkout"
            className="mt-5 block rounded-full bg-brand-600 py-3.5 text-center font-semibold text-white hover:bg-brand-700"
          >
            Proceed to checkout
          </Link>
          <p className="mt-3 text-center text-xs text-ink/55">
            Apply your coupon code at checkout · Cash on Delivery available
          </p>
        </aside>
      </div>
    </div>
  );
}
