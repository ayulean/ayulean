import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import Stars from "@/components/Stars";
import { money } from "@/lib/pricing";
import { getApprovedReviewsAcrossStore, getProducts } from "@/lib/queries";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

const TRUST = [
  { icon: "🌿", title: "100% Ayurvedic", text: "Classical herbs, no chemicals" },
  { icon: "🔄", title: `${SITE.replacementDays}-Day Replacement`, text: "Damaged or wrong item? Replaced right away" },
  { icon: "🚚", title: "Free Shipping", text: `On orders above ${SITE.currency}${SITE.freeShippingAbove}` },
  { icon: "💵", title: "COD Available", text: "Cash on Delivery and online payment" },
];

const BENEFITS = [
  { icon: "⚡", title: "Natural Energy", text: "Steady energy through the day, with no caffeine crash." },
  { icon: "🔥", title: "Metabolism Support", text: "Herbs that support your body\u2019s natural metabolism." },
  { icon: "🌱", title: "Better Digestion", text: "Triphala and ginger for gut health and regularity." },
  { icon: "🛡️", title: "Lab Tested", text: "Every batch is tested by a third-party lab." },
];

const STEPS = [
  { n: "01", title: "Place your order", text: "Pay online or choose Cash on Delivery — both are available." },
  { n: "02", title: "Delivered in 2–5 days", text: "Shipped across India in safe, sealed packaging." },
  { n: "03", title: "Two capsules a day", text: "Morning and evening, 30 minutes before meals, with lukewarm water." },
  { n: "04", title: "See a difference in 90 days", text: "Regular use brings visible improvement in metabolism and digestion." },
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
  const products = await getProducts();
  const hero = products[products.length - 1] ?? products[0];
  const reviews = await getApprovedReviewsAcrossStore(6);
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 5;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-cream to-white">
        {/* Two slow-drifting washes of colour behind the hero. */}
        <div
          aria-hidden="true"
          className="anim-glow pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-brand-200/50 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="anim-glow pointer-events-none absolute -right-32 top-40 h-96 w-96 rounded-full bg-gold-400/20 blur-3xl"
          style={{ animationDelay: "-3.5s" }}
        />

        <div className="container-x relative grid items-center gap-12 py-14 lg:grid-cols-2 lg:py-24">
          <div>
            <span
              style={{ "--i": 0 } as React.CSSProperties}
              className="anim-fade-up inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-sm font-semibold text-brand-700"
            >
              🌿 Ayurveda × Modern Science
            </span>
            <h1
              style={{ "--i": 1 } as React.CSSProperties}
              className="anim-fade-up mt-5 font-display text-4xl font-bold leading-tight text-brand-900 sm:text-5xl lg:text-6xl"
            >
              Healthy on the inside,
              <br />
              <span className="text-brand-600">confident on the outside</span>
            </h1>
            <p
              style={{ "--i": 2 } as React.CSSProperties}
              className="anim-fade-up mt-5 max-w-lg text-lg leading-relaxed text-ink/70"
            >
              The {SITE.name} Ayurvedic Supplement naturally supports your metabolism, digestion and daily energy —
              100% herbal, no side effects, no added sugar.
            </p>

            {hero && (
              <div
                style={{ "--i": 3 } as React.CSSProperties}
                className="anim-fade-up mt-7 flex flex-wrap items-center gap-4"
              >
                <Link
                  href={`/product/${hero.slug}`}
                  className="rounded-full bg-brand-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-600/30"
                >
                  Order now — {money(hero.price)}
                </Link>
                <Link
                  href="/products"
                  className="rounded-full border-2 border-brand-300 px-8 py-4 text-base font-semibold text-brand-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-500 hover:bg-brand-50"
                >
                  View product
                </Link>
              </div>
            )}

            {reviews.length > 0 && (
              <div
                style={{ "--i": 4 } as React.CSSProperties}
                className="anim-fade-up mt-8 flex items-center gap-3"
              >
                <Stars value={avg} size={18} />
                <p className="text-sm text-ink/60">
                  <strong className="text-ink/80">{Math.round(avg * 10) / 10}/5</strong> from{" "}
                  {reviews.length} verified {reviews.length === 1 ? "review" : "reviews"}
                </p>
              </div>
            )}
          </div>

          <div className="anim-scale-in relative" style={{ "--i": 2 } as React.CSSProperties}>
            <div className="anim-glow absolute -inset-6 rounded-[3rem] bg-brand-200/40 blur-3xl" aria-hidden="true" />
            <div className="anim-float relative overflow-hidden rounded-[2rem] border border-brand-100 bg-white shadow-2xl">
              <Image
                src={hero?.image ?? "/img/product-1.svg"}
                alt={hero?.name ?? "Ayurvedic Supplement"}
                width={720}
                height={720}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
            {hero && hero.discountPercent > 0 && (
              <div className="anim-scale-in absolute -right-2 -top-2 rotate-6 rounded-2xl bg-gold-500 px-5 py-3 text-center text-white shadow-xl" style={{ "--i": 5 } as React.CSSProperties}>
                <p className="text-2xl font-bold leading-none">{hero.discountPercent}%</p>
                <p className="text-xs font-semibold tracking-wide">OFF</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-y border-brand-100 bg-white">
        <div className="container-x grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map((t, i) => (
            <div
              key={t.title}
              style={{ "--i": i } as React.CSSProperties}
              className="reveal group flex items-start gap-3"
            >
              <span
                className="text-2xl transition-transform duration-300 group-hover:scale-110"
                aria-hidden="true"
              >
                {t.icon}
              </span>
              <div>
                <p className="font-semibold text-brand-800">{t.title}</p>
                <p className="text-sm text-ink/60">{t.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="container-x py-16 lg:py-20">
        <div className="reveal text-center">
          <h2 className="font-display text-3xl font-bold text-brand-900 sm:text-4xl">Our Product</h2>
          <p className="mx-auto mt-3 max-w-xl text-ink/60">
            One formula, crafted with complete care — so you do not need anything else.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* BENEFITS */}
      <section className="bg-cream py-16 lg:py-20">
        <div className="container-x">
          <h2 className="reveal text-center font-display text-3xl font-bold text-brand-900 sm:text-4xl">
            Why {SITE.name}?
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b, i) => (
              <div
                key={b.title}
                style={{ "--i": i } as React.CSSProperties}
                className="reveal lift group rounded-2xl border border-brand-100 bg-white p-6 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-900/5"
              >
                <span
                  className="inline-block text-3xl transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110"
                  aria-hidden="true"
                >
                  {b.icon}
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-brand-800">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container-x py-16 lg:py-20">
        <h2 className="reveal text-center font-display text-3xl font-bold text-brand-900 sm:text-4xl">How it works</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div
              key={s.n}
              style={{ "--i": i } as React.CSSProperties}
              className="reveal lift group relative rounded-2xl border border-brand-100 p-6 hover:border-brand-300 hover:bg-brand-50/40"
            >
              <span className="font-display text-4xl font-bold text-brand-200 transition-colors duration-300 group-hover:text-brand-400">
                {s.n}
              </span>
              <h3 className="mt-2 font-semibold text-brand-800">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      {reviews.length > 0 && (
        <section className="bg-brand-800 py-16 text-white lg:py-20">
          <div className="container-x">
            <h2 className="reveal text-center font-display text-3xl font-bold sm:text-4xl">What our customers say</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((r, i) => (
                <figure
                  key={r.id}
                  style={{ "--i": i } as React.CSSProperties}
                  className="reveal lift rounded-2xl bg-white/10 p-6 backdrop-blur hover:bg-white/15"
                >
                  <Stars value={r.rating} size={15} />
                  {r.title && <figcaption className="mt-3 font-semibold">{r.title}</figcaption>}
                  <blockquote className="mt-2 text-sm leading-relaxed text-white/80">“{r.body}”</blockquote>
                  <p className="mt-4 text-sm font-medium text-brand-200">— {r.name}</p>
                </figure>
              ))}
            </div>
            <p className="mt-10 text-center">
              <Link
                href={`/product/${hero?.slug ?? "ayurvedic-supplement"}#reviews`}
                className="rounded-full bg-white px-7 py-3 font-semibold text-brand-800 hover:bg-brand-50"
              >
                Read all reviews &amp; write your own
              </Link>
            </p>
          </div>
        </section>
      )}

      {/* GUARANTEE */}
      <section className="container-x py-16 lg:py-20">
        <div className="reveal grid items-center gap-10 rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50 to-cream p-8 lg:grid-cols-2 lg:p-12">
          <div>
            <span className="inline-block rounded-full bg-gold-500 px-4 py-1.5 text-sm font-bold text-white">
              {SITE.replacementDays}-DAY REPLACEMENT
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold text-brand-900">Order with complete peace of mind</h2>
            <p className="mt-4 leading-relaxed text-ink/70">
              If the product arrives damaged, leaked, expired or incorrect, tell us within {SITE.replacementDays} days
              of delivery — we send a free replacement. No questions, no extra charges.
            </p>
            <Link
              href="/policies/replacement"
              className="mt-6 inline-block rounded-full border-2 border-brand-600 px-6 py-3 font-semibold text-brand-700 hover:bg-white"
            >
              Read the full policy
            </Link>
          </div>
          <ul className="space-y-4">
            {[
              "Raise the request within 7 days of delivery",
              "The product must be in its original sealed packaging",
              "We arrange the pickup — you do not have to do anything",
              "Replacement delivered within 5–7 working days",
            ].map((li, i) => (
              <li
                key={li}
                style={{ "--i": i } as React.CSSProperties}
                className="reveal flex items-start gap-3 rounded-xl bg-white p-4 transition-shadow duration-300 hover:shadow-md"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                  ✓
                </span>
                <span className="text-sm text-ink/75">{li}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-x pb-20">
        <h2 className="reveal text-center font-display text-3xl font-bold text-brand-900 sm:text-4xl">
          Frequently asked questions
        </h2>
        <div className="reveal mx-auto mt-10 max-w-3xl divide-y divide-brand-100 rounded-2xl border border-brand-100">
          {FAQS.map((f) => (
            <details key={f.q} className="group p-5 transition-colors duration-300 open:bg-brand-50/40">
              <summary className="cursor-pointer list-none font-semibold text-brand-800 transition-colors hover:text-brand-600 marker:hidden">
                <span className="flex items-center justify-between gap-4">
                  {f.q}
                  <span className="text-xl text-brand-400 transition-transform duration-300 ease-out group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="details-body mt-3 text-sm leading-relaxed text-ink/70">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-600 py-14 text-white">
        <div className="container-x flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Start your Ayurvedic routine today</h2>
            <p className="mt-2 text-white/80">Cash on Delivery · Free shipping · {SITE.replacementDays}-day replacement</p>
          </div>
          <Link
            href={`/product/${hero?.slug ?? "ayurvedic-supplement"}`}
            className="shrink-0 rounded-full bg-white px-8 py-4 font-semibold text-brand-700 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-50 hover:shadow-xl"
          >
            Order Now
          </Link>
        </div>
      </section>
    </>
  );
}
