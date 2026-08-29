import Image from "next/image";
import Link from "next/link";
import { money } from "@/lib/pricing";
import type { Product } from "@/lib/types";
import Stars from "./Stars";
import WishlistButton from "./WishlistButton";

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white transition hover:border-brand-300 hover:shadow-lg">
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
        <div className="relative aspect-square overflow-hidden bg-brand-50">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 300px, 50vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          {product.discountPercent > 0 && (
            <span className="absolute left-3 top-3 rounded-full bg-gold-500 px-2.5 py-1 text-xs font-bold text-white">
              {product.discountPercent}% OFF
            </span>
          )}
          {product.stock <= 0 && (
            <span className="absolute bottom-3 left-3 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white">
              Out of stock
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="font-display text-lg font-semibold text-brand-800">{product.name}</h3>
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
