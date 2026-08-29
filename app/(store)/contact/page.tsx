import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Contact Us", description: `${SITE.name} customer support — ${SITE.phone}` };

export default function ContactPage() {
  return (
    <div className="container-x py-14">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-4xl font-bold text-brand-900">Contact Us</h1>
        <p className="mt-3 text-ink/65">
          Any question, order update or replacement request — we are here to help. Monday to Saturday, 10 AM – 7 PM.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <a
            href={`tel:${SITE.phone.replace(/\s/g, "")}`}
            className="rounded-2xl border border-brand-100 p-6 transition hover:border-brand-300 hover:bg-brand-50"
          >
            <span className="text-3xl" aria-hidden="true">📞</span>
            <h2 className="mt-3 font-display text-lg font-bold text-brand-800">Call us</h2>
            <p className="mt-1 text-brand-700">{SITE.phone}</p>
          </a>

          <a
            href={`https://wa.me/${SITE.phoneRaw}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-brand-100 p-6 transition hover:border-brand-300 hover:bg-brand-50"
          >
            <span className="text-3xl" aria-hidden="true">💬</span>
            <h2 className="mt-3 font-display text-lg font-bold text-brand-800">WhatsApp</h2>
            <p className="mt-1 text-brand-700">{SITE.phone}</p>
          </a>

          <a
            href={`mailto:${SITE.email}`}
            className="rounded-2xl border border-brand-100 p-6 transition hover:border-brand-300 hover:bg-brand-50"
          >
            <span className="text-3xl" aria-hidden="true">✉️</span>
            <h2 className="mt-3 font-display text-lg font-bold text-brand-800">Email</h2>
            <p className="mt-1 text-brand-700">{SITE.email}</p>
          </a>

          <div className="rounded-2xl border border-brand-100 p-6">
            <span className="text-3xl" aria-hidden="true">📍</span>
            <h2 className="mt-3 font-display text-lg font-bold text-brand-800">Address</h2>
            <p className="mt-1 text-sm leading-relaxed text-ink/70">{SITE.address}</p>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-brand-100">
          <iframe
            title="AyuLean location — Sector 13, Karnal"
            src="https://maps.google.com/maps?q=Sector%2013%20Karnal%20Haryana&t=&z=14&ie=UTF8&iwloc=&output=embed"
            className="h-80 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}
