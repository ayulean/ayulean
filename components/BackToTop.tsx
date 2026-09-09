"use client";

import { useEffect, useState } from "react";

/**
 * Appears once the visitor is a screen or two down a long page — the store has
 * several of those (product detail, policies, the home page).
 */
export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      // Kept mounted so it can animate both ways; hidden from assistive tech
      // and pointer events while it is off screen.
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      // On a phone the product page keeps a buy bar pinned to the bottom, so
      // this sits above it and only drops to the corner on a wide screen.
      className={`fixed bottom-20 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white/90 text-brand-700 shadow-card backdrop-blur transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-brand-50 lg:bottom-5 lg:right-5 print:hidden ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 16V4m0 0L4.5 9.5M10 4l5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export default BackToTop;
