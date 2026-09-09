import type { Metadata } from "next";
import Icon, { type IconName } from "@/components/Icon";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `${SITE.name} customer support — ${SITE.phone}`,
};

const CHANNELS: Array<{
  icon: IconName;
  title: string;
  value: string;
  href?: string;
  external?: boolean;
}> = [
  { icon: "phone", title: "Call us", value: SITE.phone, href: `tel:${SITE.phoneRaw}` },
  { icon: "chat", title: "WhatsApp", value: SITE.phone, href: `https://wa.me/${SITE.phoneRaw}`, external: true },
  { icon: "mail", title: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
  { icon: "pin", title: "Address", value: SITE.address },
];

export default function ContactPage() {
  return (
    <div className="container-x py-12 lg:py-16">
      <div className="mx-auto max-w-3xl">
        <header>
          <p className="eyebrow">Support</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-brand-900">Contact us</h1>
          <p className="mt-3 leading-relaxed text-ink/60">
            Any question, order update or replacement request — we are here to help. Monday to Saturday,
            10 AM to 7 PM.
          </p>
        </header>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {CHANNELS.map((c) => {
            const inner = (
              <>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon name={c.icon} size={19} />
                </span>
                <h2 className="mt-3.5 font-display text-lg font-bold text-brand-800">{c.title}</h2>
                <p className="mt-1 break-words text-sm leading-relaxed text-ink/65">{c.value}</p>
              </>
            );

            return c.href ? (
              <a
                key={c.title}
                href={c.href}
                {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="card card-pad transition-[box-shadow,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card"
              >
                {inner}
              </a>
            ) : (
              <div key={c.title} className="card card-pad">
                {inner}
              </div>
            );
          })}
        </div>

        <div className="mt-8 overflow-hidden rounded-card border border-line">
          <iframe
            title="Angad Ayurveda location — Sector 13, Karnal"
            src="https://maps.google.com/maps?q=Sector%2013%20Karnal%20Haryana&t=&z=14&ie=UTF8&iwloc=&output=embed"
            className="h-72 w-full border-0 sm:h-80"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}
