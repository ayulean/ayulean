import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/Icon";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us",
  description: `${SITE.name} — an Ayurvedic wellness brand based in Karnal, Haryana.`,
};

const STATS = [
  { n: "GMP", l: "Certified manufacturing" },
  { n: "3rd-party", l: "Lab tested batches" },
  { n: `${SITE.replacementDays} days`, l: "Easy replacement" },
];

export default function AboutPage() {
  return (
    <div className="container-x py-12 lg:py-16">
      <div className="mx-auto max-w-3xl">
        <header>
          <Image
            src={SITE.logo}
            alt=""
            width={72}
            height={72}
            className="h-18 w-18 rounded-full object-cover ring-1 ring-line"
          />
          <p className="eyebrow mt-6">Our story</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-brand-900">
            We are {SITE.name}
          </h1>
        </header>

        <div className="mt-6 space-y-5 text-[1.0625rem] leading-relaxed text-ink/65">
          <p>
            {SITE.name} started with one simple belief — the benefits of Ayurveda should reach every home,
            without confusing labels and without false promises. We operate out of {SITE.addressShort} and
            deliver across India.
          </p>
          <p>
            We make one product, and it carries all of our effort: the{" "}
            <strong className="font-semibold text-ink/80">Ayurvedic Supplement</strong>. It is a balanced blend
            of classical herbs — Garcinia, Green Tea, Triphala, Guggul and Ginger — that naturally supports
            metabolism, digestion and daily energy.
          </p>
          <p>
            Every batch is made in a GMP-certified facility and tested by a third-party lab. No added sugar, no
            preservatives, no hidden ingredients. What is printed on the label is exactly what is in the bottle.
          </p>
        </div>

        <dl className="mt-10 grid gap-4 sm:grid-cols-3">
          {STATS.map((s) => (
            <div key={s.l} className="card card-pad bg-surface-muted text-center">
              <dt className="font-display text-2xl font-bold tracking-tight text-brand-700">{s.n}</dt>
              <dd className="mt-1 text-sm text-ink/55">{s.l}</dd>
            </div>
          ))}
        </dl>

        <div className="card card-pad mt-10">
          <h2 className="font-display text-xl font-bold text-brand-800">Get in touch</h2>
          <ul className="mt-4 space-y-3 text-sm text-ink/65">
            <li className="flex items-start gap-2.5">
              <Icon name="pin" size={16} className="mt-0.5 text-brand-500" />
              {SITE.address}
            </li>
            <li>
              <a
                href={`tel:${SITE.phoneRaw}`}
                className="inline-flex items-center gap-2.5 transition-colors hover:text-brand-700"
              >
                <Icon name="phone" size={16} className="text-brand-500" />
                {SITE.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${SITE.email}`}
                className="inline-flex items-center gap-2.5 break-all transition-colors hover:text-brand-700"
              >
                <Icon name="mail" size={16} className="text-brand-500" />
                {SITE.email}
              </a>
            </li>
          </ul>
        </div>

        <p className="mt-8 rounded-card bg-surface-muted p-5 text-xs leading-relaxed text-ink/50">
          <strong className="font-semibold">Disclaimer:</strong> This product is an Ayurvedic food/dietary
          supplement, not a medicine. It makes no claim to diagnose, treat or cure any disease. If you are
          pregnant, breastfeeding, have a medical condition or are on ongoing medication, consult a qualified
          doctor before use.
        </p>

        <Link href="/product/ayurvedic-supplement" className="btn btn-primary btn-lg mt-8">
          View the product
          <Icon name="arrow-right" size={17} />
        </Link>
      </div>
    </div>
  );
}
