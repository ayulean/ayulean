import Image from "next/image";
import Link from "next/link";
import Icon, { type IconName } from "@/components/Icon";
import ProductGrid from "@/components/ProductGrid";
import Stars from "@/components/Stars";
import { money } from "@/lib/pricing";
import { getApprovedReviewsAcrossStore, getProducts } from "@/lib/queries";
import { SITE } from "@/lib/site";

const TRUST: Array<{ icon: IconName; title: string; text: string }> = [
  { icon: "leaf", title: "100% Ayurvedic", text: "Classical herbs, no chemicals" },
  { icon: "refresh", title: `${SITE.replacementDays}-day replacement`, text: "Damaged or wrong item, replaced free" },
  { icon: "truck", title: "Free shipping", text: `On orders above ${SITE.currency}${SITE.freeShippingAbove}` },
  { icon: "banknote", title: "Cash on Delivery", text: "Or pay by UPI, card, netbanking" },
];

const BENEFITS: Array<{ icon: IconName; title: string; text: string }> = [
  { icon: "zap", title: "Natural energy", text: "Steady energy through the day, with no caffeine crash." },
  { icon: "flame", title: "Metabolism support", text: "Herbs that support your body’s natural metabolism." },
  { icon: "sprout", title: "Better digestion", text: "Triphala and ginger for gut health and regularity." },
  { icon: "shield", title: "Lab tested", text: "Every batch is tested by a third-party lab." },
];

const STEPS = [
  { n: "01", title: "Place your order", text: "Pay online or choose Cash on Delivery — both are available." },
  { n: "02", title: "Delivered in 2–5 days", text: "Shipped across India in safe, sealed packaging." },
  { n: "03", title: "Two capsules a day", text: "Morning and evening, 30 minutes before meals, with lukewarm water." },
  { n: "04", title: "See a difference in 90 days", text: "Regular use brings visible improvement in metabolism and digestion." },
];

const GUARANTEE_POINTS = [
  "Raise the request within 7 days of delivery",
  "The product must be in its original sealed packaging",
  "We arrange the pickup — you do not have to do anything",
  "Replacement delivered within 5–7 working days",
];

const FAQS = [
  {
    q: "Is this product safe?",
    a: "Yes. Angad Ayurveda's Ayurvedic Supplement is made from classical Ayurvedic herbs, manufactured in a GMP-certified facility, and every batch is third-party lab tested. That said, if you are pregnant, breastfeeding or on any ongoing medication, please consult your doctor before use.",
  },
  {
    q: "How soon will I see results?",
    a: "Most customers notice a difference in digestion and energy within 3–4 weeks. For the best outcome we recommend using it consistently for 90 days, alongside a healthy diet and regular activity.",
  },
  {
    q: "Is Cash on Delivery available?",
    a: "Absolutely. You can choose Cash on Delivery, or pay online by UPI, card or netbanking — both options are offered at checkout.",
  },
  {
    q: `How does the ${SITE.replacementDays}-day replacement work?`,
    a: `If the product arrives damaged, leaked, expired or incorrect, call or WhatsApp us at ${SITE.phone} within ${SITE.replacementDays} days of delivery. We send a replacement at no extra cost.`,
  },
  {
    q: "What are the shipping charges?",
    a: `Shipping is completely free on orders above ${SITE.currency}${SITE.freeShippingAbove}. Below that, a flat ${SITE.currency}${SITE.shippingFee} shipping fee applies.`,
  },
];

export default async function HomePage() {
  const [products, reviews] = await Promise.all([getProducts(), getApprovedReviewsAcrossStore(6)]);
  const hero = products[products.length - 1] ?? products[0];
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 5;

  return (
    <>
      {/* ---------------------------------------------------------------- HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 to-white">
        <div
          aria-hidden="true"
          className="anim-glow pointer-events-none absolute -right-40 -top-24 h-[28rem] w-[28rem] rounded-full bg-brand-200/35 blur-3xl"
        />

        <div className="container-x relative grid items-center gap-10 py-14 lg:grid-cols-[1.15fr_1fr] lg:gap-14 lg:py-24">
          <div>
            <span
              style={{ "--i": 0 } as React.CSSProperties}
              className="anim-fade-up chip border border-brand-200 bg-white text-brand-700"
            >
              <Icon name="sparkle" size={14} />
              Ayurveda × modern science
            </span>

            <h1
              style={{ "--i": 1 } as React.CSSProperties}
              className="anim-fade-up mt-5 text-balance font-display text-[2.125rem] font-bold leading-[1.12] tracking-tight text-brand-900 sm:text-[2.75rem] lg:text-[3.25rem]"
            >
              Healthy on the inside,{" "}
              <span className="text-brand-600">confident on the outside</span>
            </h1>

            <p
              style={{ "--i": 2 } as React.CSSProperties}
              className="anim-fade-up mt-5 max-w-lg text-[1.0625rem] leading-relaxed text-ink/60"
            >
              The {SITE.name} Ayurvedic Supplement naturally supports your metabolism, digestion and daily
              energy — 100% herbal, no side effects, no added sugar.
            </p>

            {hero && (
              <div
                style={{ "--i": 3 } as React.CSSProperties}
                className="anim-fade-up mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
              >
                <Link href={`/product/${hero.slug}`} className="btn btn-primary btn-lg">
                  Order now — {money(hero.price)}
                  <Icon name="arrow-right" size={17} />
                </Link>
                <Link href="/products" className="btn btn-secondary btn-lg">
                  Browse the shop
                </Link>
              </div>
            )}

            {reviews.length > 0 && (
              <div
                style={{ "--i": 4 } as React.CSSProperties}
                className="anim-fade-up mt-7 flex items-center gap-3"
              >
                <Stars value={avg} size={17} />
                <p className="text-sm text-ink/55">
                  <strong className="font-semibold text-ink/80">{Math.round(avg * 10) / 10}/5</strong> from{" "}
                  {reviews.length} verified {reviews.length === 1 ? "review" : "reviews"}
                </p>
              </div>
            )}
          </div>

          <div className="anim-scale-in relative order-first lg:order-none" style={{ "--i": 2 } as React.CSSProperties}>
            <div className="relative overflow-hidden rounded-panel border border-line bg-white shadow-card">
              <Image
                src={hero?.image ?? "/img/product-1.svg"}
                alt={hero?.name ?? "Ayurvedic Supplement"}
                width={720}
                height={720}
                sizes="(min-width: 1024px) 520px, 92vw"
                className="h-auto w-full object-cover"
                priority
              />
            </div>

            {hero && hero.discountPercent > 0 && (
              <div className="absolute -right-1 -top-3 rounded-2xl bg-gold-500 px-4 py-2.5 text-center text-white shadow-lift sm:-right-3">
                <p className="text-xl font-bold leading-none">{hero.discountPercent}%</p>
                <p className="mt-0.5 text-[0.625rem] font-semibold uppercase tracking-widest">off</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- TRUST STRIP */}
      <section className="border-y border-line bg-surface-muted">
        <div className="container-x grid gap-x-6 gap-y-5 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map((t, i) => (
            <div key={t.title} style={{ "--i": i } as React.CSSProperties} className="reveal flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                <Icon name={t.icon} size={17} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-brand-800">{t.title}</p>
                <p className="mt-0.5 text-[0.8125rem] leading-snug text-ink/55">{t.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ PRODUCTS */}
      <section className="container-x section">
        <div className="reveal mx-auto max-w-xl text-center">
          <p className="eyebrow">Our range</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
            Made with complete care
          </h2>
          <p className="mt-3 text-ink/55">
            One formula, crafted properly — so you do not need anything else on your shelf.
          </p>
        </div>

        <ProductGrid products={products} className="mt-10" />
      </section>

      {/* ------------------------------------------------------------ BENEFITS */}
      <section className="bg-surface-muted">
        <div className="container-x section">
          <div className="reveal mx-auto max-w-xl text-center">
            <p className="eyebrow">Why {SITE.name}</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
              What it actually does
            </h2>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b, i) => (
              <div
                key={b.title}
                style={{ "--i": i } as React.CSSProperties}
                className="reveal card card-pad transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-card"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon name={b.icon} size={21} />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-brand-800">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/60">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- HOW IT WORKS */}
      <section className="container-x section">
        <div className="reveal mx-auto max-w-xl text-center">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
            From order to results
          </h2>
        </div>

        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li
              key={s.n}
              style={{ "--i": i } as React.CSSProperties}
              className="reveal relative rounded-card border border-line p-5 transition-colors duration-300 hover:border-brand-200 hover:bg-brand-50/40"
            >
              <span className="font-display text-3xl font-bold text-brand-200">{s.n}</span>
              <h3 className="mt-2 font-semibold text-brand-800">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------------------- REVIEWS */}
      {reviews.length > 0 && (
        <section className="bg-brand-800 text-white">
          <div className="container-x section">
            <div className="reveal mx-auto max-w-xl text-center">
              <p className="eyebrow text-brand-300">Reviews</p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                What our customers say
              </h2>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((r, i) => (
                <figure
                  key={r.id}
                  style={{ "--i": i } as React.CSSProperties}
                  className="reveal rounded-card border border-white/10 bg-white/[0.07] p-5 backdrop-blur transition-colors duration-300 hover:bg-white/[0.12]"
                >
                  <Stars value={r.rating} size={14} />
                  {r.title && <figcaption className="mt-3 font-semibold">{r.title}</figcaption>}
                  <blockquote className="mt-2 text-sm leading-relaxed text-white/75">“{r.body}”</blockquote>
                  <p className="mt-4 text-sm font-medium text-brand-200">— {r.name}</p>
                </figure>
              ))}
            </div>

            <p className="mt-10 text-center">
              <Link
                href={`/product/${hero?.slug ?? "ayurvedic-supplement"}#reviews`}
                className="btn bg-white text-brand-800 hover:bg-brand-50"
              >
                Read all reviews
                <Icon name="arrow-right" size={16} />
              </Link>
            </p>
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------- GUARANTEE */}
      <section className="container-x section">
        <div className="reveal grid items-center gap-8 rounded-panel border border-line bg-gradient-to-br from-brand-50 to-surface-muted p-6 sm:p-9 lg:grid-cols-2 lg:gap-12 lg:p-12">
          <div>
            <span className="chip bg-gold-500 text-white">
              <Icon name="shield" size={14} />
              {SITE.replacementDays}-day replacement
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-brand-900">
              Order with complete peace of mind
            </h2>
            <p className="mt-4 leading-relaxed text-ink/65">
              If the product arrives damaged, leaked, expired or incorrect, tell us within{" "}
              {SITE.replacementDays} days of delivery — we send a free replacement. No questions, no extra
              charges.
            </p>
            <Link href="/policies/replacement" className="btn btn-secondary mt-6">
              Read the full policy
            </Link>
          </div>

          <ul className="space-y-3">
            {GUARANTEE_POINTS.map((li, i) => (
              <li
                key={li}
                style={{ "--i": i } as React.CSSProperties}
                className="reveal flex items-start gap-3 rounded-xl bg-white p-4 shadow-soft"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                  <Icon name="check" size={12} strokeWidth={3} />
                </span>
                <span className="text-sm leading-relaxed text-ink/70">{li}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ----------------------------------------------------------------- FAQ */}
      <section className="container-x pb-20">
        <div className="reveal mx-auto max-w-xl text-center">
          <p className="eyebrow">Questions</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
            Frequently asked
          </h2>
        </div>

        <div className="reveal mx-auto mt-10 max-w-3xl divide-y divide-line overflow-hidden rounded-card border border-line">
          {FAQS.map((f) => (
            <details key={f.q} className="group p-5 transition-colors duration-300 open:bg-brand-50/40">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-brand-800 transition-colors hover:text-brand-600 marker:hidden">
                {f.q}
                <Icon
                  name="chevron-down"
                  size={18}
                  className="shrink-0 text-brand-400 transition-transform duration-300 ease-out group-open:rotate-180"
                />
              </summary>
              <p className="details-body mt-3 text-sm leading-relaxed text-ink/65">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------------------- CTA */}
      <section className="bg-brand-600 text-white">
        <div className="container-x flex flex-col items-center justify-between gap-6 py-12 text-center sm:flex-row sm:text-left">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Start your Ayurvedic routine today
            </h2>
            <p className="mt-2 text-white/75">
              Cash on Delivery · Free shipping · {SITE.replacementDays}-day replacement
            </p>
          </div>
          <Link
            href={`/product/${hero?.slug ?? "ayurvedic-supplement"}`}
            className="btn btn-lg shrink-0 bg-white text-brand-700 hover:bg-brand-50"
          >
            Order now
            <Icon name="arrow-right" size={17} />
          </Link>
        </div>
      </section>
    </>
  );
}
