"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import EmptyState from "@/components/EmptyState";
import Icon from "@/components/Icon";
import { useWishlist } from "@/components/WishlistProvider";
import { money } from "@/lib/pricing";

export default function WishlistPage() {
  const { items, ready, remove, clear } = useWishlist();
  const { add } = useCart();

  if (!ready) {
    return (
      <div className="container-x py-20">
        <div className="skeleton h-9 w-40 rounded-lg" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="skeleton h-32 rounded-card" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon="heart"
        title="Your wishlist is empty"
        text="Tap the heart on any product to save it for later."
        action={{ href: "/products", label: "Browse the shop" }}
      />
    );
  }

  return (
    <div className="container-x py-10 lg:py-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">Wishlist</h1>
          <p className="mt-1.5 text-sm text-ink/50">
            {items.length} saved {items.length === 1 ? "item" : "items"}
          </p>
        </div>
        <button
          type="button"
          onClick={clear}
          className="text-sm font-medium text-ink/50 transition-colors hover:text-red-600"
        >
          Clear all
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {items.map((i) => (
          <div key={i.productId} className="card flex gap-4 p-4">
            <Link
              href={`/product/${i.slug}`}
              className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-muted"
            >
              <Image src={i.image} alt={i.name} fill sizes="96px" className="object-cover" />
            </Link>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
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

              <p className="mt-1 text-sm">
                <span className="font-bold text-brand-700">{money(i.price)}</span>
                {i.mrp > i.price && <span className="ml-2 text-ink/30 line-through">{money(i.mrp)}</span>}
              </p>

              <div className="mt-auto pt-3">
                <button
                  type="button"
                  onClick={() => {
                    add({ ...i }, 1);
                    remove(i.productId);
                  }}
                  className="btn btn-primary btn-sm"
                >
                  <Icon name="bag" size={14} />
                  Move to cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
