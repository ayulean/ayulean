import Image from "next/image";
import Link from "next/link";
import { COMPLIANCE, SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-brand-100 bg-cream print:hidden">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="reveal" style={{ "--i": 0 } as React.CSSProperties}>
          <div className="flex items-center gap-2.5">
            <Image
              src={SITE.logo}
              alt={`${SITE.name} logo`}
              width={44}
              height={44}
              className="h-11 w-11 rounded-full object-cover ring-1 ring-brand-200 transition-transform duration-300 hover:scale-105"
            />
            <span className="font-display text-2xl font-bold text-brand-800">{SITE.name}</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-ink/70">{SITE.tagline}</p>
          <p className="mt-4 text-sm text-ink/70">
            {COMPLIANCE.legalName || SITE.name}
            <br />
            {SITE.address}
          </p>
          <p className="mt-3 space-y-0.5 text-xs text-ink/60">
            {COMPLIANCE.fssai && <span className="block">FSSAI Lic. No. {COMPLIANCE.fssai}</span>}
            {COMPLIANCE.ayushLicence && <span className="block">AYUSH Lic. No. {COMPLIANCE.ayushLicence}</span>}
            {SITE.gstin && <span className="block">GSTIN {SITE.gstin}</span>}
          </p>
        </div>

        <div className="reveal" style={{ "--i": 1 } as React.CSSProperties}>
          <h3 className="font-semibold text-brand-800">Shop</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ink/70">
            <li><Link href="/products" className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-brand-600">All Products</Link></li>
            <li><Link href="/product/ayurvedic-supplement" className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-brand-600">Ayurvedic Supplement</Link></li>
            <li><Link href="/cart" className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-brand-600">Cart</Link></li>
            <li><Link href="/track" className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-brand-600">Track Your Order</Link></li>
            <li><Link href="/wishlist" className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-brand-600">Wishlist</Link></li>
          </ul>
        </div>

        <div className="reveal" style={{ "--i": 2 } as React.CSSProperties}>
          <h3 className="font-semibold text-brand-800">Policies</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ink/70">
            <li><Link href="/policies/replacement" className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-brand-600">{SITE.replacementDays}-Day Replacement</Link></li>
            <li><Link href="/replacement" className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-brand-600">Request a Replacement</Link></li>
            <li><Link href="/policies/shipping" className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-brand-600">Shipping Policy</Link></li>
            <li><Link href="/policies/refund" className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-brand-600">Cancellation &amp; Refund Policy</Link></li>
            <li><Link href="/policies/privacy" className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-brand-600">Privacy Policy</Link></li>
            <li><Link href="/policies/terms" className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-brand-600">Terms &amp; Conditions</Link></li>
          </ul>
        </div>

        <div className="reveal" style={{ "--i": 3 } as React.CSSProperties}>
          <h3 className="font-semibold text-brand-800">Contact</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ink/70">
            <li>{SITE.address}</li>
            <li>
              <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-brand-600">{SITE.phone}</a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-brand-600">{SITE.email}</a>
            </li>
            <li>
              <a
                href={`https://wa.me/${SITE.phoneRaw}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-md"
              >
                Chat on WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-100">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-xs text-ink/60 sm:flex-row">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p className="flex items-center gap-3">
            <span>Cash on Delivery &amp; online payment available</span>
            <Link href="/admin" className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-brand-600">Admin</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
