import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { money } from "@/lib/pricing";
import type { Product } from "@/lib/types";
import Stars from "./Stars";
import WishlistButton from "./WishlistButton";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  return (
    <div
      style={{ "--i": index } as React.CSSProperties}
      className="reveal lift group relative flex flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white hover:border-brand-300 hover:shadow-xl hover:shadow-brand-900/10"
    >
      <WishlistButton
        item={{
          productId: product.id,
          slug: product.slug,
          name: product.name,
          image: product.image,
          price: product.price,
          mrp: product.mrp,
        }}
      />

      <Link
        href={`/product/${product.slug}`}
        className="flex flex-1 flex-col"
      >
        <div className="relative aspect-square overflow-hidden bg-brand-50">
          {/* Shares its name with the hero on the detail page, so the browser
              animates one image moving instead of two images swapping. */}
          <ViewTransition name={`product-image-${product.id}`} share="morph" default="none">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 300px, 50vw"
              priority={index === 0}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
            />
          </ViewTransition>

          {/* Gradient only appears on hover, so the badges stay readable. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-brand-900/45 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />

          {product.discountPercent > 0 && (
            <span className="absolute left-3 top-3 rounded-full bg-gold-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
              {product.discountPercent}% OFF
            </span>
          )}
          {product.isBundle && (
            <span className="absolute left-3 bottom-3 rounded-full bg-brand-700 px-2.5 py-1 text-xs font-bold text-white">
              COMBO · {product.components.reduce((n, c) => n + c.qty, 0)} items
            </span>
          )}
          {product.available <= 0 && (
            <span className="absolute bottom-3 left-3 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white">
              Out of stock
            </span>
          )}

          {/* Slides up out of the bottom edge on hover. */}
          <span className="pointer-events-none absolute inset-x-3 bottom-3 translate-y-3 rounded-full bg-white/95 py-2 text-center text-sm font-semibold text-brand-700 opacity-0 shadow-lg backdrop-blur transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
            View details →
          </span>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="font-display text-lg font-semibold text-brand-800 transition-colors group-hover:text-brand-600">
            {product.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-ink/60">{product.subtitle}</p>

          <div className="mt-2 flex items-center gap-2">
            <Stars value={product.rating} size={14} />
            <span className="text-xs text-ink/50">
              {product.rating > 0 ? `${product.rating} (${product.reviewCount})` : "New"}
            </span>
          </div>

          <div className="mt-auto flex items-baseline gap-2 pt-4">
            <span className="text-xl font-bold text-brand-700">{money(product.price)}</span>
            {product.mrp > product.price && (
              <span className="text-sm text-ink/40 line-through">{money(product.mrp)}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

export default ProductCard;
