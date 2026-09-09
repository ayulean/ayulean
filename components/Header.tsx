"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
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

const isActive = (pathname: string | null, href: string) =>
  pathname === null ? false : href === "/" ? pathname === "/" : pathname.startsWith(href);

/**
 * The navigation links, with the current page marked.
 *
 * `pathname` is passed in rather than read here so the same component can serve
 * as its own Suspense fallback: on a route whose path is not known until the
 * request (a product page), the header still prerenders — it just arrives
 * without the active-page underline, which fills in a moment later.
 */
function DesktopNav({ pathname }: { pathname: string | null }) {
  return (
    <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-ink/80">
      {NAV.map((n) => {
        const active = isActive(pathname, n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            aria-current={active ? "page" : undefined}
            className={`group relative py-1 transition-colors hover:text-brand-600 ${active ? "text-brand-700" : ""}`}
          >
            {n.label}
            {/* Underline grows from the centre on hover, and stays put on
                the page you are already on. */}
            <span
              aria-hidden="true"
              className={`absolute inset-x-0 -bottom-0.5 h-0.5 origin-center rounded-full bg-brand-500 transition-transform duration-300 ease-out group-hover:scale-x-100 ${
                active ? "scale-x-100" : "scale-x-0"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}

function LiveDesktopNav() {
  return <DesktopNav pathname={usePathname()} />;
}

function MobileNavLinks({ pathname, onNavigate }: { pathname: string | null; onNavigate: () => void }) {
  return (
    <>
      {NAV.map((n, i) => (
        <Link
          key={n.href}
          href={n.href}
          style={{ "--i": i } as React.CSSProperties}
          onClick={onNavigate}
          className={`anim-fade-up py-2.5 text-sm font-medium transition-colors hover:text-brand-600 ${
            isActive(pathname, n.href) ? "text-brand-700" : "text-ink/80"
          }`}
        >
          {n.label}
        </Link>
      ))}
    </>
  );
}

function LiveMobileNavLinks({ onNavigate }: { onNavigate: () => void }) {
  return <MobileNavLinks pathname={usePathname()} onNavigate={onNavigate} />;
}

/**
 * `accountBar` and `accountMenu` are server-rendered slots holding the account
 * link. They arrive as already-rendered nodes so the header itself never waits
 * on the session lookup behind them.
 */
export function Header({ accountBar, accountMenu }: { accountBar: ReactNode; accountMenu: ReactNode }) {
  const { count, ready } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

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

          <Suspense fallback={<DesktopNav pathname={null} />}>
            <LiveDesktopNav />
          </Suspense>

          <div className="flex items-center gap-2">
            {accountBar}
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
              <Suspense fallback={<MobileNavLinks pathname={null} onNavigate={() => setOpen(false)} />}>
                <LiveMobileNavLinks onNavigate={() => setOpen(false)} />
              </Suspense>
              {/* The link itself is server-rendered, so the close-on-tap handler
                  and the stagger delay live on a wrapper that adds no box. */}
              <span
                className="contents"
                style={{ "--i": NAV.length } as React.CSSProperties}
                onClick={() => setOpen(false)}
              >
                {accountMenu}
              </span>
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
