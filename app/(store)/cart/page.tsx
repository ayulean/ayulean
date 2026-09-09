"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import EmptyState from "@/components/EmptyState";
import Icon from "@/components/Icon";
import { money, shippingFor } from "@/lib/pricing";
import { SITE } from "@/lib/site";

export default function CartPage() {
  const { items, subtotal, setQty, remove, ready } = useCart();
  const shipping = shippingFor(subtotal);

  if (!ready) {
    return (
      <div className="container-x py-20">
        <div className="skeleton h-9 w-48 rounded-lg" />
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {[0, 1].map((i) => (
              <div key={i} className="skeleton h-32 rounded-card" />
            ))}
          </div>
          <div className="skeleton h-64 rounded-card" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon="bag"
        title="Your cart is empty"
        text="Let us get your Ayurvedic routine started."
        action={{ href: "/products", label: "Browse the shop" }}
      />
    );
  }

  return (
    <div className="container-x py-10 lg:py-14">
      <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">Shopping cart</h1>
      <p className="mt-1.5 text-sm text-ink/50">
        {items.length} {items.length === 1 ? "item" : "items"}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="space-y-4 lg:col-span-2">
          {items.map((i) => (
            <div key={i.productId} className="card flex gap-4 p-4">
              <Link
                href={`/product/${i.slug}`}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-muted"
              >
                <Image src={i.image} alt={i.name} fill sizes="96px" className="object-cover" />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/product/${i.slug}`}
                    className="font-semibold text-brand-800 transition-colors hover:text-brand-600"
                  >
                    {i.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(i.productId)}
                    aria-label={`Remove ${i.name}`}
                    className="-m-1.5 shrink-0 rounded-full p-1.5 text-ink/35 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Icon name="close" size={16} />
                  </button>
                </div>

                <p className="mt-1 text-sm text-ink/55">
                  {money(i.price)}
                  {i.mrp > i.price && <span className="ml-2 text-ink/30 line-through">{money(i.mrp)}</span>}
                </p>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                  <div className="inline-flex items-center rounded-full border border-line-strong">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => setQty(i.productId, i.qty - 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-l-full text-brand-700 transition-colors hover:bg-brand-50"
                    >
                      <Icon name="minus" size={14} />
                    </button>
                    <span className="w-9 text-center text-sm font-semibold tabular-nums">{i.qty}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => setQty(i.productId, Math.min(10, i.qty + 1))}
                      className="flex h-9 w-9 items-center justify-center rounded-r-full text-brand-700 transition-colors hover:bg-brand-50"
                    >
                      <Icon name="plus" size={14} />
                    </button>
                  </div>
                  <p className="font-bold tracking-tight text-brand-700">{money(i.price * i.qty)}</p>
                </div>
              </div>
            </div>
          ))}

          <Link href="/products" className="btn btn-ghost btn-sm">
            Continue shopping
          </Link>
        </div>

        <aside className="card card-pad h-fit bg-surface-muted lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-bold text-brand-800">Order summary</h2>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink/55">Subtotal</dt>
              <dd className="font-medium tabular-nums">{money(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/55">Shipping</dt>
              <dd className={`font-medium tabular-nums ${shipping === 0 ? "text-brand-600" : ""}`}>
                {shipping === 0 ? "Free" : money(shipping)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base">
              <dt className="font-semibold">Total</dt>
              <dd className="font-bold tabular-nums text-brand-700">{money(subtotal + shipping)}</dd>
            </div>
          </dl>

          {shipping > 0 && (
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-white p-3 text-xs leading-relaxed text-ink/60">
              <Icon name="truck" size={15} className="mt-px text-brand-500" />
              Add {money(SITE.freeShippingAbove - subtotal)} more to get free shipping.
            </p>
          )}

          <Link href="/checkout" className="btn btn-primary btn-lg btn-block mt-5">
            Proceed to checkout
          </Link>
          <p className="mt-3 text-center text-xs leading-relaxed text-ink/50">
            Apply your coupon at checkout · Cash on Delivery available
          </p>
        </aside>
      </div>
    </div>
  );
}
