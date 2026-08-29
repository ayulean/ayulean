"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SITE } from "@/lib/site";
import { useCart } from "./CartProvider";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/policies/replacement", label: "7-Day Replacement" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/track", label: "Track Order" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const { count, ready } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="bg-brand-700 text-white text-xs sm:text-sm">
        <div className="container-x flex items-center justify-center gap-2 py-2 text-center">
          <span className="hidden sm:inline">🌿</span>
          <span>
            100% Ayurvedic · Free shipping over {SITE.currency}
            {SITE.freeShippingAbove} · {SITE.replacementDays}-Day Easy Replacement
          </span>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-brand-100 bg-white/95 backdrop-blur">
        <div className="container-x flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src={SITE.logo}
              alt={`${SITE.name} logo`}
              width={44}
              height={44}
              className="h-11 w-11 rounded-full object-cover ring-1 ring-brand-200"
              priority
            />
            <span className="font-display text-2xl font-bold tracking-tight text-brand-800">{SITE.name}</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-ink/80">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="hover:text-brand-600 transition-colors">
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${SITE.phone.replace(/\s/g, "")}`}
              className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-brand-200 px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
            >
              📞 {SITE.phone}
            </a>
            <Link
              href="/cart"
              className="relative inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Cart
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-bold text-brand-700">
                {ready ? count : 0}
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-label="Menu"
              className="lg:hidden rounded-md border border-brand-200 p-2 text-brand-700"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <nav className="lg:hidden border-t border-brand-100 bg-white">
            <div className="container-x flex flex-col py-2">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="py-2.5 text-sm font-medium text-ink/80 hover:text-brand-600"
                >
                  {n.label}
                </Link>
              ))}
              <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="py-2.5 text-sm font-medium text-brand-700">
                📞 {SITE.phone}
              </a>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}

export default Header;
