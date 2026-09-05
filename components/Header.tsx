"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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

export function Header({ userName }: { userName: string | null }) {
  const { count, ready } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // The menu remembers which route it was opened on, so a navigation closes it
  // without needing an effect to chase the pathname.
  const [menu, setMenu] = useState({ open: false, path: pathname });
  const open = menu.open && menu.path === pathname;
  const setOpen = (next: boolean) => setMenu({ open: next, path: pathname });

  // The header condenses once the visitor leaves the top of the page, which
  // hands the content back some vertical room on small screens.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Bump the cart badge on every change except the first paint, so restoring a
  // saved cart on load does not animate.
  const [bump, setBump] = useState(0);
  const seen = useRef<number | null>(null);
  useEffect(() => {
    if (!ready) return;
    if (seen.current !== null && seen.current !== count) setBump((b) => b + 1);
    seen.current = count;
  }, [count, ready]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <div className="bg-brand-700 text-white text-xs sm:text-sm print:hidden">
        <div className="container-x flex items-center justify-center gap-2 py-2 text-center">
          <span className="hidden sm:inline">🌿</span>
          <span>
            100% Ayurvedic · Free shipping over {SITE.currency}
            {SITE.freeShippingAbove} · {SITE.replacementDays}-Day Easy Replacement
          </span>
        </div>
      </div>

      <header
        style={{ viewTransitionName: "site-header" }}
        className={`sticky top-0 z-50 border-b bg-white/85 backdrop-blur-md transition-[box-shadow,border-color,background-color] duration-300 print:hidden ${
          scrolled ? "border-brand-100 shadow-sm shadow-brand-900/5" : "border-transparent"
        }`}
      >
        <div
          className={`container-x flex items-center justify-between gap-4 transition-[height] duration-300 ${
            scrolled ? "h-14" : "h-16"
          }`}
        >
          <Link href="/" className="group flex items-center gap-2.5">
            <Image
              src={SITE.logo}
              alt={`${SITE.name} logo`}
              width={44}
              height={44}
              className={`rounded-full object-cover ring-1 ring-brand-200 transition-all duration-300 group-hover:ring-brand-400 group-hover:rotate-6 ${
                scrolled ? "h-9 w-9" : "h-11 w-11"
              }`}
              priority
            />
            <span
              className={`font-display font-bold tracking-tight text-brand-800 transition-all duration-300 ${
                scrolled ? "text-xl" : "text-2xl"
              }`}
            >
              {SITE.name}
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-ink/80">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                aria-current={isActive(n.href) ? "page" : undefined}
                className={`group relative py-1 transition-colors hover:text-brand-600 ${
                  isActive(n.href) ? "text-brand-700" : ""
                }`}
              >
                {n.label}
                {/* Underline grows from the centre on hover, and stays put on
                    the page you are already on. */}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 -bottom-0.5 h-0.5 origin-center rounded-full bg-brand-500 transition-transform duration-300 ease-out group-hover:scale-x-100 ${
                    isActive(n.href) ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href={userName ? "/account" : "/account/login"}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-brand-200 px-3 py-2 text-sm font-medium text-brand-700 transition-colors hover:border-brand-300 hover:bg-brand-50"
            >
              <span aria-hidden="true">👤</span>
              {userName ?? "Log in"}
            </Link>
            <Link
              href="/cart"
              className="relative inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-600/20 transition-all duration-200 hover:bg-brand-700 hover:shadow-md hover:shadow-brand-600/30"
            >
              Cart
              <span
                key={bump}
                className="anim-pop inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-bold text-brand-700"
              >
                {ready ? count : 0}
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-label="Menu"
              className="lg:hidden rounded-md border border-brand-200 p-2 text-brand-700 transition-colors hover:bg-brand-50"
            >
              {/* Three bars fold into a cross. */}
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M3 5h14"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  className="origin-center transition-transform duration-300"
                  style={open ? { transform: "translateY(5px) rotate(45deg)" } : undefined}
                />
                <path
                  d="M3 10h14"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  className="origin-center transition-opacity duration-200"
                  style={open ? { opacity: 0 } : undefined}
                />
                <path
                  d="M3 15h14"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  className="origin-center transition-transform duration-300"
                  style={open ? { transform: "translateY(-5px) rotate(-45deg)" } : undefined}
                />
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <nav className="lg:hidden overflow-hidden border-t border-brand-100 bg-white">
            <div className="container-x flex flex-col py-2">
              {NAV.map((n, i) => (
                <Link
                  key={n.href}
                  href={n.href}
                  style={{ "--i": i } as React.CSSProperties}
                  onClick={() => setOpen(false)}
                  className={`anim-fade-up py-2.5 text-sm font-medium transition-colors hover:text-brand-600 ${
                    isActive(n.href) ? "text-brand-700" : "text-ink/80"
                  }`}
                >
                  {n.label}
                </Link>
              ))}
              <Link
                href={userName ? "/account" : "/account/login"}
                style={{ "--i": NAV.length } as React.CSSProperties}
                onClick={() => setOpen(false)}
                className="anim-fade-up py-2.5 text-sm font-medium text-brand-700"
              >
                👤 {userName ? "My account" : "Log in / Sign up"}
              </Link>
              <a
                href={`tel:${SITE.phone.replace(/\s/g, "")}`}
                style={{ "--i": NAV.length + 1 } as React.CSSProperties}
                className="anim-fade-up py-2.5 text-sm font-medium text-brand-700"
              >
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
