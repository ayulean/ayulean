import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import AddToCart from "@/components/AddToCart";
import ProductCard from "@/components/ProductCard";
import ProductDetailSkeleton from "@/components/ProductDetailSkeleton";
import ProductGallery from "@/components/ProductGallery";
import ReviewForm from "@/components/ReviewForm";
import Stars from "@/components/Stars";
import { TrackViewItem } from "@/components/TrackEvent";
import WishlistButton from "@/components/WishlistButton";
import Image from "next/image";
import { money } from "@/lib/pricing";
import { getProductBySlug, getProducts, getReviews, ratingBreakdown } from "@/lib/queries";
import { complianceRows, SITE } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return { title: product.name, description: product.subtitle };
}

/**
 * The slug is only known at request time, so it is awaited inside the boundary.
 * That lets Next.js prerender a shell for any product URL and stream the
 * product itself in, instead of holding the whole response back.
 */
export default function ProductPage({ params }: PageProps<"/product/[slug]">) {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetail params={params} />
    </Suspense>
  );
}

async function ProductDetail({ params }: Pick<PageProps<"/product/[slug]">, "params">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.active) notFound();

  const [reviews, allProducts] = await Promise.all([getReviews(product.id), getProducts()]);
  const related = allProducts.filter((p) => p.id !== product.id).slice(0, 4);
  const breakdown = ratingBreakdown(reviews);
  const gallery = product.gallery.length ? product.gallery : [product.image];
  const rows = complianceRows();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.subtitle,
    image: gallery,
    brand: { "@type": "Brand", name: SITE.name },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "INR",
      availability: product.available > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    ...(product.reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
      },
    }),
  };

  return (
    <div className="container-x py-10 lg:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <TrackViewItem
        item={{
          productId: product.id,
          slug: product.slug,
          name: product.name,
          image: product.image,
          price: product.price,
          mrp: product.mrp,
        }}
      />

      <nav className="text-sm text-ink/50">
        <Link href="/" className="hover:text-brand-600">Home</Link> ·{" "}
        <Link href="/products" className="hover:text-brand-600">Shop</Link> ·{" "}
        <span className="text-ink/70">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <ProductGallery images={gallery} alt={product.name} morphName={`product-image-${product.id}`} />

        <div>
          <h1 className="font-display text-3xl font-bold text-brand-900 lg:text-4xl">{product.name}</h1>
          <p className="mt-2 text-lg text-ink/65">{product.subtitle}</p>

          <a href="#reviews" className="mt-3 inline-flex items-center gap-2">
            <Stars value={product.rating} size={17} />
            <span className="text-sm text-ink/60 underline-offset-2 hover:underline">
              {product.reviewCount > 0 ? `${product.rating} · ${product.reviewCount} reviews` : "Be the first to review"}
            </span>
          </a>

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="text-4xl font-bold text-brand-700">{money(product.price)}</span>
            {product.mrp > product.price && (
              <>
                <span className="text-xl text-ink/40 line-through">{money(product.mrp)}</span>
                <span className="rounded-full bg-gold-500 px-3 py-1 text-sm font-bold text-white">
                  {product.discountPercent}% OFF
                </span>
              </>
            )}
          </div>
          <p className="mt-1 text-sm text-ink/50">Inclusive of all taxes</p>

          {product.isBundle && (
            <section className="mt-6 rounded-2xl border border-brand-200 bg-brand-50 p-5">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-brand-800">
                <span className="rounded-full bg-brand-700 px-2.5 py-0.5 text-xs font-bold text-white">COMBO</span>
                What&rsquo;s inside
              </h2>

              <ul className="mt-4 space-y-3">
                {product.components.map((c) => (
                  <li key={c.productId} className="flex items-center gap-3">
                    <Link
                      href={`/product/${c.slug}`}
                      className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-brand-200 bg-white"
                    >
                      <Image src={c.image} alt="" fill sizes="56px" className="object-cover" />
                    </Link>
                    <span className="flex-1 text-sm">
                      <Link href={`/product/${c.slug}`} className="font-medium text-brand-800 hover:text-brand-600">
                        {c.name}
                      </Link>
                      <span className="block text-ink/55">
                        {c.qty} × {money(c.price)}
                      </span>
                    </span>
                    <span className="text-sm font-semibold text-ink/70">{money(c.price * c.qty)}</span>
                  </li>
                ))}
              </ul>

              {product.separateValue > product.price && (
                <p className="mt-4 rounded-xl bg-white p-3 text-sm text-ink/75">
                  Bought separately this costs{" "}
                  <strong className="text-ink/60 line-through">{money(product.separateValue)}</strong> — you save{" "}
                  <strong className="text-brand-700">{money(product.separateValue - product.price)}</strong> with
                  this combo.
                </p>
              )}
            </section>
          )}

          <AddToCart product={product} />

          <WishlistButton
            variant="full"
            item={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              image: product.image,
              price: product.price,
              mrp: product.mrp,
            }}
          />

          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {[
              { icon: "💵", text: "Cash on Delivery available" },
              { icon: "💳", text: "UPI / Card / Netbanking" },
              { icon: "🔄", text: `${SITE.replacementDays}-day easy replacement` },
              { icon: "🚚", text: `Free shipping above ${money(SITE.freeShippingAbove)}` },
            ].map((f) => (
              <li key={f.text} className="flex items-center gap-2.5 rounded-xl bg-brand-50 px-4 py-3 text-sm text-ink/75">
                <span aria-hidden="true">{f.icon}</span>
                {f.text}
              </li>
            ))}
          </ul>

          {product.benefits.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-xl font-bold text-brand-800">Key Benefits</h2>
              <ul className="mt-3 space-y-2.5">
                {product.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-ink/75">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                      ✓
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* DETAILS */}
      <div className="mt-16 grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="font-display text-2xl font-bold text-brand-900">About this product</h2>
          {product.description.split("\n\n").map((para, i) => (
            <p key={i} className="mt-4 leading-relaxed text-ink/70">{para}</p>
          ))}
        </section>

        <aside className="space-y-6">
          {product.ingredients && (
            <div className="rounded-2xl border border-brand-100 bg-cream p-6">
              <h3 className="font-display text-lg font-bold text-brand-800">Ingredients</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">{product.ingredients}</p>
            </div>
          )}
          {product.how_to_use && (
            <div className="rounded-2xl border border-brand-100 bg-cream p-6">
              <h3 className="font-display text-lg font-bold text-brand-800">How to use</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">{product.how_to_use}</p>
            </div>
          )}

          <div className="rounded-2xl border border-brand-100 bg-cream p-6">
            <h3 className="font-display text-lg font-bold text-brand-800">Product &amp; seller information</h3>
            <dl className="mt-3 grid gap-x-4 gap-y-2 text-xs sm:grid-cols-[max-content_1fr]">
              {rows.map((r) => (
                <div key={r.label} className="contents">
                  <dt className="font-semibold text-brand-800">{r.label}</dt>
                  <dd className="text-ink/65">{r.value}</dd>
                </div>
              ))}
              <div className="contents">
                <dt className="font-semibold text-brand-800">Customer care</dt>
                <dd className="text-ink/65">
                  <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="hover:underline">{SITE.phone}</a>
                  {" · "}
                  <a href={`mailto:${SITE.email}`} className="hover:underline">{SITE.email}</a>
                </dd>
              </div>
            </dl>
            <p className="mt-4 border-t border-brand-100 pt-4 text-xs leading-relaxed text-ink/55">
              <strong>Disclaimer:</strong> This is an Ayurvedic food/dietary supplement, not a medicine. It is not
              intended to diagnose, treat, cure or prevent any disease, and it is not a substitute for a balanced
              diet. Results vary from person to person. Not recommended for anyone under 18. If you are pregnant,
              breastfeeding, have a medical condition or are on ongoing medication, consult a qualified physician
              before use. Keep out of reach of children. Store in a cool, dry place away from direct sunlight.
            </p>
          </div>
        </aside>
      </div>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold text-brand-900">You may also like</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* REVIEWS */}
      <section id="reviews" className="mt-16 scroll-mt-24">
        <h2 className="font-display text-2xl font-bold text-brand-900">
          Reviews &amp; Ratings ({product.reviewCount})
        </h2>

        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-brand-100 p-6 text-center">
              <p className="font-display text-5xl font-bold text-brand-800">{product.rating || 0}</p>
              <div className="mt-2 flex justify-center">
                <Stars value={product.rating} size={18} />
              </div>
              <p className="mt-2 text-sm text-ink/60">{product.reviewCount} verified reviews</p>

              <div className="mt-5 space-y-1.5">
                {[5, 4, 3, 2, 1].map((n) => {
                  const c = breakdown[n] ?? 0;
                  const pct = product.reviewCount ? (c / product.reviewCount) * 100 : 0;
                  return (
                    <div key={n} className="flex items-center gap-2 text-xs text-ink/60">
                      <span className="w-8 text-right">{n} ★</span>
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-brand-100">
                        <span className="block h-full rounded-full bg-gold-400" style={{ width: `${pct}%` }} />
                      </span>
                      <span className="w-6">{c}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <ReviewForm productId={product.id} />
            </div>
          </div>

          <div className="space-y-4 lg:col-span-2">
            {reviews.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-brand-200 p-10 text-center text-ink/55">
                No reviews yet. Be the first to write one!
              </p>
            ) : (
              reviews.map((r) => (
                <article key={r.id} className="rounded-2xl border border-brand-100 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">
                        {r.name.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="font-semibold text-brand-800">{r.name}</p>
                        <p className="text-xs text-brand-600">✓ Verified buyer</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Stars value={r.rating} size={15} />
                      <p className="mt-1 text-xs text-ink/45">{new Date(r.created_at).toLocaleDateString("en-IN")}</p>
                    </div>
                  </div>
                  {r.title && <h3 className="mt-4 font-semibold text-ink/85">{r.title}</h3>}
                  <p className="mt-2 leading-relaxed text-ink/70">{r.body}</p>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
