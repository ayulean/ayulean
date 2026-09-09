import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { money } from "@/lib/pricing";
import type { Product } from "@/lib/types";
import Stars from "./Stars";
import WishlistButton from "./WishlistButton";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const out = product.available <= 0;

  return (
    <article
      style={{ "--i": index } as React.CSSProperties}
      className="reveal group relative flex flex-col overflow-hidden rounded-card border border-line bg-surface transition-[box-shadow,border-color,transform] duration-300 ease-out hover:-translate-y-1 hover:border-line-strong hover:shadow-lift"
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

      <Link href={`/product/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-square overflow-hidden bg-surface-muted">
          {/* Shares its name with the hero on the detail page, so the browser
              animates one image moving instead of two images swapping. */}
          <ViewTransition name={`product-image-${product.id}`} share="morph" default="none">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 90vw"
              priority={index === 0}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            />
          </ViewTransition>

          <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
            {product.discountPercent > 0 && (
              <span className="chip bg-gold-500 text-white shadow-soft">
                {product.discountPercent}% off
              </span>
            )}
            {product.isBundle && (
              <span className="chip bg-brand-700 text-white shadow-soft">
                Combo · {product.components.reduce((n, c) => n + c.qty, 0)} items
              </span>
            )}
          </div>

          {out && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
              <span className="chip bg-ink/80 text-white">Out of stock</span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="font-display text-[1.0625rem] font-semibold leading-snug text-brand-800 transition-colors group-hover:text-brand-600">
            {product.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink/55">{product.subtitle}</p>

          <div className="mt-2.5 flex items-center gap-2">
            <Stars value={product.rating} size={13} />
            <span className="text-xs text-ink/45">
              {product.rating > 0 ? `${product.rating} (${product.reviewCount})` : "New"}
            </span>
          </div>

          <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-1 pt-4">
            <span className="text-xl font-bold tracking-tight text-brand-700">{money(product.price)}</span>
            {product.mrp > product.price && (
              <span className="text-sm text-ink/35 line-through">{money(product.mrp)}</span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

export default ProductCard;
