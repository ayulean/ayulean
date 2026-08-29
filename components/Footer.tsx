import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-brand-100 bg-cream">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Image
              src={SITE.logo}
              alt={`${SITE.name} logo`}
              width={44}
              height={44}
              className="h-11 w-11 rounded-full object-cover ring-1 ring-brand-200"
            />
            <span className="font-display text-2xl font-bold text-brand-800">{SITE.name}</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-ink/70">{SITE.tagline}</p>
          <p className="mt-4 text-sm text-ink/70">
            GMP Certified · Ayush Compliant
            <br />
            100% Vegetarian
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-brand-800">Shop</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ink/70">
            <li><Link href="/products" className="hover:text-brand-600">All Products</Link></li>
            <li><Link href="/product/ayurvedic-supplement" className="hover:text-brand-600">Ayurvedic Supplement</Link></li>
            <li><Link href="/cart" className="hover:text-brand-600">Cart</Link></li>
            <li><Link href="/track" className="hover:text-brand-600">Track Your Order</Link></li>
            <li><Link href="/wishlist" className="hover:text-brand-600">Wishlist</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-brand-800">Policies</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ink/70">
            <li><Link href="/policies/replacement" className="hover:text-brand-600">{SITE.replacementDays}-Day Replacement</Link></li>
            <li><Link href="/replacement" className="hover:text-brand-600">Request a Replacement</Link></li>
            <li><Link href="/policies/shipping" className="hover:text-brand-600">Shipping Policy</Link></li>
            <li><Link href="/policies/privacy" className="hover:text-brand-600">Privacy Policy</Link></li>
            <li><Link href="/policies/terms" className="hover:text-brand-600">Terms &amp; Conditions</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-brand-800">Contact</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ink/70">
            <li>{SITE.address}</li>
            <li>
              <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="hover:text-brand-600">{SITE.phone}</a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="hover:text-brand-600">{SITE.email}</a>
            </li>
            <li>
              <a
                href={`https://wa.me/${SITE.phoneRaw}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
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
            <Link href="/admin" className="hover:text-brand-600">Admin</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
