"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/products", label: "Products", icon: "📦" },
  { href: "/admin/coupons", label: "Coupons", icon: "🏷️" },
  { href: "/admin/orders", label: "Orders", icon: "🧾" },
  { href: "/admin/reviews", label: "Reviews", icon: "⭐" },
  { href: "/admin/replacements", label: "Replacements", icon: "🔄" },
];

/** Sidebar links, with the section you are in kept highlighted. */
export function AdminNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
      {NAV.map((n) => {
        const active = isActive(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            aria-current={active ? "page" : undefined}
            className={`group relative flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              active
                ? "bg-brand-100 text-brand-800"
                : "text-ink/75 hover:bg-brand-50 hover:text-brand-700"
            }`}
          >
            {/* A rail on the left edge marks the current section on desktop. */}
            <span
              aria-hidden="true"
              className={`absolute left-0 top-1/2 hidden h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand-600 transition-transform duration-200 lg:block ${
                active ? "scale-y-100" : "scale-y-0"
              }`}
            />
            <span
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:scale-110"
            >
              {n.icon}
            </span>
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default AdminNav;
