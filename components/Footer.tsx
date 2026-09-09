import { cacheLife } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { COMPLIANCE, SITE } from "@/lib/site";
import Icon from "./Icon";

/**
 * The copyright year. Reading the clock during a prerender is not allowed, so
 * it is cached — a value that only moves once a year is safe to hold for a day.
 */
async function copyrightYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

const SHOP_LINKS = [
  { href: "/products", label: "All products" },
  { href: "/cart", label: "Cart" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/track", label: "Track your order" },
  { href: "/account/orders", label: "My orders" },
];

const POLICY_LINKS = [
  { href: "/policies/replacement", label: `${SITE.replacementDays}-day replacement` },
  { href: "/replacement", label: "Request a replacement" },
  { href: "/policies/shipping", label: "Shipping policy" },
  { href: "/policies/refund", label: "Cancellation & refund" },
  { href: "/policies/privacy", label: "Privacy policy" },
  { href: "/policies/terms", label: "Terms & conditions" },
];

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="inline-block py-0.5 text-ink/60 transition-colors duration-200 hover:text-brand-700"
      >
        {children}
      </Link>
    </li>
  );
}

export async function Footer() {
  const year = await copyrightYear();

  return (
    <footer className="mt-20 border-t border-line bg-surface-muted print:hidden">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
        <div className="reveal lg:col-span-4" style={{ "--i": 0 } as React.CSSProperties}>
          <div className="flex items-center gap-2.5">
            <Image
              src={SITE.logo}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover ring-1 ring-line"
            />
            <span className="font-display text-xl font-bold text-brand-800">{SITE.name}</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink/60">{SITE.tagline}</p>

          <address className="mt-5 not-italic text-sm leading-relaxed text-ink/60">
            {COMPLIANCE.legalName || SITE.name}
            <br />
            {SITE.address}
          </address>

          {(COMPLIANCE.fssai || COMPLIANCE.ayushLicence || SITE.gstin) && (
            <dl className="mt-4 space-y-1 text-xs text-ink/45">
              {COMPLIANCE.fssai && <div>FSSAI Lic. No. {COMPLIANCE.fssai}</div>}
              {COMPLIANCE.ayushLicence && <div>AYUSH Lic. No. {COMPLIANCE.ayushLicence}</div>}
              {SITE.gstin && <div>GSTIN {SITE.gstin}</div>}
            </dl>
          )}
        </div>

        <nav className="reveal lg:col-span-2" style={{ "--i": 1 } as React.CSSProperties}>
          <h2 className="text-sm font-semibold text-brand-800">Shop</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {SHOP_LINKS.map((l) => (
              <FooterLink key={l.href} href={l.href}>
                {l.label}
              </FooterLink>
            ))}
          </ul>
        </nav>

        <nav className="reveal lg:col-span-3" style={{ "--i": 2 } as React.CSSProperties}>
          <h2 className="text-sm font-semibold text-brand-800">Policies</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {POLICY_LINKS.map((l) => (
              <FooterLink key={l.href} href={l.href}>
                {l.label}
              </FooterLink>
            ))}
          </ul>
        </nav>

        <div className="reveal lg:col-span-3" style={{ "--i": 3 } as React.CSSProperties}>
          <h2 className="text-sm font-semibold text-brand-800">Get in touch</h2>
          <ul className="mt-4 space-y-3 text-sm text-ink/60">
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

          <a
            href={`https://wa.me/${SITE.phoneRaw}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm mt-5"
          >
            <Icon name="chat" size={15} />
            Chat on WhatsApp
          </a>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-5 text-xs text-ink/50 sm:flex-row">
          <p>
            © {year} {SITE.name}. All rights reserved.
          </p>
          <p className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="lock" size={13} />
              Secure payments · COD available
            </span>
            <Link href="/admin" className="transition-colors hover:text-brand-700">
              Admin
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
