"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { SITE } from "@/lib/site";
import Icon from "./Icon";
import { useCart } from "./CartProvider";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/policies/replacement", label: "Replacement" },
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
 * without the active-page marker, which fills in a moment later.
 */
function DesktopNav({ pathname }: { pathname: string | null }) {
  return (
    <nav className="hidden items-center gap-0.5 lg:flex">
      {NAV.map((n) => {
        const active = isActive(pathname, n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            aria-current={active ? "page" : undefined}
            className={`relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200 ${
              active ? "text-brand-700" : "text-ink/65 hover:bg-brand-50 hover:text-brand-700"
            }`}
          >
            {n.label}
            {active && (
              <span
                aria-hidden="true"
                className="absolute inset-x-3.5 -bottom-1 h-0.5 rounded-full bg-brand-600"
              />
            )}
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
      {NAV.map((n, i) => {
        const active = isActive(pathname, n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            style={{ "--i": i } as React.CSSProperties}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`anim-fade-up flex items-center justify-between rounded-xl px-3 py-3 text-[0.9375rem] font-medium transition-colors ${
              active ? "bg-brand-50 text-brand-700" : "text-ink/75 hover:bg-brand-50"
            }`}
          >
            {n.label}
            <Icon name="arrow-right" size={16} className="opacity-30" />
          </Link>
        );
      })}
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

  // The page behind an open mobile menu must not scroll.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

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
      <div className="bg-brand-800 text-white print:hidden">
        <div className="container-x flex items-center justify-center gap-2 py-2 text-center text-[0.8125rem] leading-snug">
          <Icon name="leaf" size={15} className="hidden opacity-70 sm:block" />
          {/* The full line is a mouthful on a phone, so the narrow screen gets
              the two facts that actually move a sale. */}
          <span className="sm:hidden">
            Free shipping over {SITE.currency}
            {SITE.freeShippingAbove} · COD available
          </span>
          <span className="hidden sm:inline">
            100% Ayurvedic · Free shipping over {SITE.currency}
            {SITE.freeShippingAbove} · {SITE.replacementDays}-day replacement
          </span>
        </div>
      </div>

      {open && (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 cursor-default bg-ink/25 lg:hidden"
        />
      )}

      <header
        style={{ viewTransitionName: "site-header" }}
        className={`sticky top-0 z-50 border-b bg-white/85 backdrop-blur-md transition-[box-shadow,border-color] duration-300 print:hidden ${
          scrolled || open ? "border-line shadow-soft" : "border-transparent"
        }`}
      >
        <div
          className={`container-x flex items-center justify-between gap-3 transition-[height] duration-300 ${
            scrolled ? "h-14" : "h-16"
          }`}
        >
          <Link href="/" className="group flex min-w-0 items-center gap-2.5">
            <Image
              src={SITE.logo}
              alt=""
              width={44}
              height={44}
              className={`rounded-full object-cover ring-1 ring-line transition-all duration-300 group-hover:ring-brand-300 ${
                scrolled ? "h-9 w-9" : "h-10 w-10"
              }`}
              priority
            />
            <span className="truncate font-display text-[1.0625rem] font-bold tracking-tight text-brand-800 sm:text-xl">
              {SITE.name}
            </span>
          </Link>

          <Suspense fallback={<DesktopNav pathname={null} />}>
            <LiveDesktopNav />
          </Suspense>

          <div className="flex items-center gap-1">
            {accountBar}

            <Link
              href="/cart"
              aria-label={`Cart, ${ready ? count : 0} items`}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-brand-700 transition-colors hover:bg-brand-50 sm:h-auto sm:w-auto sm:gap-2 sm:bg-brand-600 sm:px-4 sm:py-2.5 sm:text-white sm:shadow-soft sm:hover:bg-brand-700"
            >
              <Icon name="bag" size={19} />
              <span className="hidden text-sm font-semibold sm:inline">Cart</span>
              <span
                key={bump}
                className="anim-pop absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-500 px-1 text-[0.6875rem] font-bold text-white ring-2 ring-white sm:static sm:bg-white sm:text-brand-700 sm:ring-0"
              >
                {ready ? count : 0}
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-brand-700 transition-colors hover:bg-brand-50 lg:hidden"
            >
              <Icon name={open ? "close" : "menu"} size={20} />
            </button>
          </div>
        </div>

        {open && (
          <nav className="anim-slide-down border-t border-line bg-white lg:hidden">
            <div className="container-x flex max-h-[70vh] flex-col gap-0.5 overflow-y-auto py-3">
              <Suspense fallback={<MobileNavLinks pathname={null} onNavigate={() => setOpen(false)} />}>
                <LiveMobileNavLinks onNavigate={() => setOpen(false)} />
              </Suspense>

              <div className="my-2 h-px bg-line" />

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
                href={`tel:${SITE.phoneRaw}`}
                style={{ "--i": NAV.length + 1 } as React.CSSProperties}
                className="anim-fade-up flex items-center gap-2.5 rounded-xl px-3 py-3 text-[0.9375rem] font-medium text-brand-700 hover:bg-brand-50"
              >
                <Icon name="phone" size={17} />
                {SITE.phone}
              </a>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}

export default Header;
