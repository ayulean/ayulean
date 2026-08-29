import type { Metadata } from "next";
import Link from "next/link";
import { money } from "@/lib/pricing";
import { dashboardStats, getOrders, getProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Admin Dashboard", robots: { index: false } };

export default async function AdminDashboard() {
  const [stats, orders, products] = await Promise.all([
    dashboardStats(),
    getOrders(),
    getProducts({ includeInactive: true }),
  ]);
  const recent = orders.slice(0, 8);
  const lowStock = products.filter((p) => p.stock <= 10);

  const cards = [
    { label: "Total orders", value: String(stats.orders), icon: "🧾" },
    { label: "Revenue", value: money(stats.revenue), icon: "💰" },
    { label: "COD / Online", value: `${stats.cod} / ${stats.online}`, icon: "💳" },
    { label: "Products", value: String(stats.products), icon: "📦" },
    { label: "Reviews pending", value: String(stats.pendingReviews), icon: "⭐" },
    { label: "Open replacements", value: String(stats.openReplacements), icon: "🔄" },
  ];

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-brand-900">Dashboard</h1>
      <p className="mt-1 text-sm text-ink/55">A complete overview of your store in one place.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-brand-100 bg-white p-5">
            <span className="text-2xl" aria-hidden="true">{c.icon}</span>
            <p className="mt-3 text-2xl font-bold text-brand-800">{c.value}</p>
            <p className="text-sm text-ink/55">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-brand-100 bg-white p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-brand-800">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm text-brand-600 hover:underline">View all →</Link>
          </div>

          {recent.length === 0 ? (
            <p className="mt-6 text-sm text-ink/50">No orders have come in yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-100 text-left text-xs uppercase text-ink/50">
                    <th className="py-2 pr-3">Order</th>
                    <th className="py-2 pr-3">Customer</th>
                    <th className="py-2 pr-3">Total</th>
                    <th className="py-2 pr-3">Payment</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-50">
                  {recent.map((o) => (
                    <tr key={o.id}>
                      <td className="py-2.5 pr-3 font-mono text-xs">{o.order_no}</td>
                      <td className="py-2.5 pr-3">{o.customer_name}</td>
                      <td className="py-2.5 pr-3 font-semibold">{money(o.total)}</td>
                      <td className="py-2.5 pr-3 uppercase text-xs">{o.payment_method}</td>
                      <td className="py-2.5">
                        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-700">{o.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-brand-100 bg-white p-5">
          <h2 className="font-display text-lg font-bold text-brand-800">Stock alert</h2>
          {lowStock.length === 0 ? (
            <p className="mt-4 text-sm text-ink/50">Stock levels look healthy across all products. 👍</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <Link href={`/admin/products/${p.id}`} className="text-brand-700 hover:underline">{p.name}</Link>
                  <span className={p.stock === 0 ? "font-bold text-red-600" : "font-semibold text-gold-600"}>
                    {p.stock} left
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 space-y-2">
            <Link
              href="/admin/products/new"
              className="block rounded-full bg-brand-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-700"
            >
              + Add a new product
            </Link>
            <Link
              href="/admin/coupons"
              className="block rounded-full border border-brand-300 py-2.5 text-center text-sm font-semibold text-brand-700 hover:bg-brand-50"
            >
              Create a coupon
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
