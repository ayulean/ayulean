import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us",
  description: `${SITE.name} — an Ayurvedic wellness brand based in Karnal, Haryana.`,
};

export default function AboutPage() {
  return (
    <div className="container-x py-14">
      <div className="mx-auto max-w-3xl">
        <Image
          src={SITE.logo}
          alt={`${SITE.name} logo`}
          width={80}
          height={80}
          className="h-20 w-20 rounded-full object-cover ring-2 ring-brand-200"
        />
        <h1 className="mt-6 font-display text-4xl font-bold text-brand-900">We are {SITE.name}</h1>

        <div className="mt-6 space-y-5 leading-relaxed text-ink/70">
          <p>
            {SITE.name} started with one simple belief — the benefits of Ayurveda should reach every home, without
            confusing labels and without false promises. We operate out of {SITE.addressShort} and deliver across
            India.
          </p>
          <p>
            We make one product, and it carries all of our effort: the <strong>Ayurvedic Supplement</strong>. It is a
            balanced blend of classical herbs — Garcinia, Green Tea, Triphala, Guggul and Ginger — that naturally
            supports metabolism, digestion and daily energy.
          </p>
          <p>
            Every batch is made in a GMP-certified facility and tested by a third-party lab. No added sugar, no
            preservatives, no hidden ingredients. What is printed on the label is exactly what is in the bottle.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {[
            { n: "10,000+", l: "Happy customers" },
            { n: "4.6/5", l: "Average rating" },
            { n: `${SITE.replacementDays} days`, l: "Easy replacement" },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border border-brand-100 bg-cream p-6 text-center">
              <p className="font-display text-3xl font-bold text-brand-700">{s.n}</p>
              <p className="mt-1 text-sm text-ink/60">{s.l}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-brand-100 p-6">
          <h2 className="font-display text-xl font-bold text-brand-800">Get in touch</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink/70">
            {SITE.address}
            <br />
            📞 <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="text-brand-700 hover:underline">{SITE.phone}</a>
            <br />
            ✉️ <a href={`mailto:${SITE.email}`} className="text-brand-700 hover:underline">{SITE.email}</a>
          </p>
        </div>

        <p className="mt-8 rounded-xl bg-cream p-5 text-xs leading-relaxed text-ink/55">
          <strong>Disclaimer:</strong> This product is an Ayurvedic food/dietary supplement, not a medicine. It makes
          no claim to diagnose, treat or cure any disease. If you are pregnant, breastfeeding, have a medical condition
          or are on ongoing medication, consult a qualified doctor before use.
        </p>

        <Link
          href="/product/ayurvedic-supplement"
          className="mt-8 inline-block rounded-full bg-brand-600 px-8 py-3.5 font-semibold text-white hover:bg-brand-700"
        >
          View the product
        </Link>
      </div>
    </div>
  );
}
