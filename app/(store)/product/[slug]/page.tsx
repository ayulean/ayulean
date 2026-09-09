import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import AddToCart from "@/components/AddToCart";
import Icon, { type IconName } from "@/components/Icon";
import ProductDetailSkeleton from "@/components/ProductDetailSkeleton";
import ProductGallery from "@/components/ProductGallery";
import ProductGrid from "@/components/ProductGrid";
import ReviewForm from "@/components/ReviewForm";
import Stars from "@/components/Stars";
import { TrackViewItem } from "@/components/TrackEvent";
import WishlistButton from "@/components/WishlistButton";
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

const ASSURANCES: Array<{ icon: IconName; text: string }> = [
  { icon: "banknote", text: "Cash on Delivery available" },
  { icon: "card", text: "UPI / card / netbanking" },
  { icon: "refresh", text: `${SITE.replacementDays}-day easy replacement` },
  { icon: "truck", text: `Free shipping above ${SITE.currency}${SITE.freeShippingAbove}` },
];

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
    <div className="container-x py-8 lg:py-12">
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

      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[0.8125rem] text-ink/45">
        <Link href="/" className="transition-colors hover:text-brand-600">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/products" className="transition-colors hover:text-brand-600">
          Shop
        </Link>
        <span aria-hidden="true">/</span>
        <span className="truncate text-ink/65">{product.name}</span>
      </nav>

      <div className="mt-5 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery images={gallery} alt={product.name} morphName={`product-image-${product.id}`} />

        <div>
          <h1 className="font-display text-[1.75rem] font-bold leading-tight tracking-tight text-brand-900 sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-2 text-[1.0625rem] leading-relaxed text-ink/60">{product.subtitle}</p>

          <a href="#reviews" className="mt-3 inline-flex items-center gap-2">
            <Stars value={product.rating} size={16} />
            <span className="text-sm text-ink/55 underline-offset-2 hover:underline">
              {product.reviewCount > 0
                ? `${product.rating} · ${product.reviewCount} reviews`
                : "Be the first to review"}
            </span>
          </a>

          <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
            <span className="text-[2.125rem] font-bold leading-none tracking-tight text-brand-700">
              {money(product.price)}
            </span>
            {product.mrp > product.price && (
              <>
                <span className="text-lg text-ink/35 line-through">{money(product.mrp)}</span>
                <span className="chip bg-gold-500 text-white">{product.discountPercent}% off</span>
              </>
            )}
          </div>
          <p className="mt-1.5 text-[0.8125rem] text-ink/45">Inclusive of all taxes</p>

          {product.isBundle && (
            <section className="mt-6 rounded-card border border-brand-200 bg-brand-50/60 p-5">
              <h2 className="flex flex-wrap items-center gap-2 font-display text-lg font-bold text-brand-800">
                <span className="chip bg-brand-700 text-white">Combo</span>
                What&rsquo;s inside
              </h2>

              <ul className="mt-4 space-y-3">
                {product.components.map((c) => (
                  <li key={c.productId} className="flex items-center gap-3">
                    <Link
                      href={`/product/${c.slug}`}
                      className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-line bg-white"
                    >
                      <Image src={c.image} alt="" fill sizes="56px" className="object-cover" />
                    </Link>
                    <span className="min-w-0 flex-1 text-sm">
                      <Link
                        href={`/product/${c.slug}`}
                        className="font-medium text-brand-800 transition-colors hover:text-brand-600"
                      >
                        {c.name}
                      </Link>
                      <span className="block text-ink/50">
                        {c.qty} × {money(c.price)}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-ink/70">
                      {money(c.price * c.qty)}
                    </span>
                  </li>
                ))}
              </ul>

              {product.separateValue > product.price && (
                <p className="mt-4 rounded-xl bg-white p-3 text-sm leading-relaxed text-ink/70">
                  Bought separately this costs{" "}
                  <strong className="font-medium text-ink/50 line-through">{money(product.separateValue)}</strong>{" "}
                  — you save{" "}
                  <strong className="font-semibold text-brand-700">
                    {money(product.separateValue - product.price)}
                  </strong>{" "}
                  with this combo.
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

          <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
            {ASSURANCES.map((f) => (
              <li
                key={f.text}
                className="flex items-center gap-2.5 rounded-xl bg-surface-muted px-3.5 py-3 text-[0.8125rem] text-ink/70"
              >
                <Icon name={f.icon} size={17} className="text-brand-600" />
                {f.text}
              </li>
            ))}
          </ul>

          {product.benefits.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-xl font-bold text-brand-800">Key benefits</h2>
              <ul className="mt-3 space-y-2.5">
                {product.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink/70">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                      <Icon name="check" size={12} strokeWidth={3} />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- DETAILS */}
      <div className="mt-16 grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="font-display text-2xl font-bold tracking-tight text-brand-900">About this product</h2>
          <div className="mt-4 space-y-4 text-[0.9375rem] leading-relaxed text-ink/70">
            {product.description.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>

        <aside className="space-y-5">
          {product.ingredients && (
            <div className="card card-pad">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold text-brand-800">
                <Icon name="leaf" size={18} className="text-brand-500" />
                Ingredients
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/65">{product.ingredients}</p>
            </div>
          )}

          {product.how_to_use && (
            <div className="card card-pad">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold text-brand-800">
                <Icon name="check-circle" size={18} className="text-brand-500" />
                How to use
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/65">{product.how_to_use}</p>
            </div>
          )}

          <div className="card card-pad bg-surface-muted">
            <h3 className="font-display text-lg font-bold text-brand-800">Product &amp; seller information</h3>
            <dl className="mt-3 grid gap-x-4 gap-y-2 text-xs sm:grid-cols-[max-content_1fr]">
              {rows.map((r) => (
                <div key={r.label} className="contents">
                  <dt className="font-semibold text-brand-800">{r.label}</dt>
                  <dd className="text-ink/60">{r.value}</dd>
                </div>
              ))}
              <div className="contents">
                <dt className="font-semibold text-brand-800">Customer care</dt>
                <dd className="text-ink/60">
                  <a href={`tel:${SITE.phoneRaw}`} className="hover:underline">
                    {SITE.phone}
                  </a>
                  {" · "}
                  <a href={`mailto:${SITE.email}`} className="break-all hover:underline">
                    {SITE.email}
                  </a>
                </dd>
              </div>
            </dl>
            <p className="mt-4 border-t border-line pt-4 text-xs leading-relaxed text-ink/50">
              <strong className="font-semibold">Disclaimer:</strong> This is an Ayurvedic food/dietary
              supplement, not a medicine. It is not intended to diagnose, treat, cure or prevent any disease,
              and it is not a substitute for a balanced diet. Results vary from person to person. Not
              recommended for anyone under 18. If you are pregnant, breastfeeding, have a medical condition or
              are on ongoing medication, consult a qualified physician before use. Keep out of reach of
              children. Store in a cool, dry place away from direct sunlight.
            </p>
          </div>
        </aside>
      </div>

      {/* ------------------------------------------------------------- RELATED */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-brand-900">You may also like</h2>
          <ProductGrid products={related} className="mt-6" />
        </section>
      )}

      {/* ------------------------------------------------------------- REVIEWS */}
      <section id="reviews" className="mt-16 scroll-mt-24">
        <h2 className="font-display text-2xl font-bold tracking-tight text-brand-900">
          Reviews &amp; ratings{product.reviewCount > 0 && ` (${product.reviewCount})`}
        </h2>

        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="card card-pad text-center">
              <p className="font-display text-5xl font-bold leading-none text-brand-800">
                {product.rating || "—"}
              </p>
              <div className="mt-3 flex justify-center">
                <Stars value={product.rating} size={17} />
              </div>
              <p className="mt-2 text-sm text-ink/55">
                {product.reviewCount} verified {product.reviewCount === 1 ? "review" : "reviews"}
              </p>

              <div className="mt-5 space-y-1.5">
                {[5, 4, 3, 2, 1].map((n) => {
                  const c = breakdown[n] ?? 0;
                  const pct = product.reviewCount ? (c / product.reviewCount) * 100 : 0;
                  return (
                    <div key={n} className="flex items-center gap-2 text-xs text-ink/55">
                      <span className="w-7 text-right tabular-nums">{n}★</span>
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                        <span
                          className="block h-full rounded-full bg-gold-400"
                          style={{ width: `${pct}%` }}
                        />
                      </span>
                      <span className="w-5 tabular-nums">{c}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-5">
              <ReviewForm productId={product.id} />
            </div>
          </div>

          <div className="space-y-4 lg:col-span-2">
            {reviews.length === 0 ? (
              <div className="flex flex-col items-center rounded-card border border-dashed border-line-strong p-10 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-ink/30">
                  <Icon name="chat" size={22} />
                </span>
                <p className="mt-3 text-ink/55">No reviews yet — be the first to write one.</p>
              </div>
            ) : (
              reviews.map((r) => (
                <article key={r.id} className="card card-pad">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">
                        {r.name.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="font-semibold text-brand-800">{r.name}</p>
                        <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-brand-600">
                          <Icon name="check-circle" size={12} />
                          Verified buyer
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Stars value={r.rating} size={14} />
                      <p className="mt-1 text-xs text-ink/40">
                        {new Date(r.created_at).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>
                  {r.title && <h3 className="mt-4 font-semibold text-ink/85">{r.title}</h3>}
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink/70">{r.body}</p>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
