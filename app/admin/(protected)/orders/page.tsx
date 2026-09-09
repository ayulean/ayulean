import type { Metadata } from "next";
import Link from "next/link";
import { updateOrderAction } from "@/lib/actions";
import { money } from "@/lib/pricing";
import { getOrders } from "@/lib/queries";

export const metadata: Metadata = { title: "Orders", robots: { index: false } };

const STATUSES = ["placed", "confirmed", "shipped", "delivered", "replacement", "cancelled", "pending_payment"];
const PAYMENT_STATUSES = ["pending", "paid", "failed"];

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-brand-900">Orders</h1>
      <p className="mt-1 text-sm text-ink/55">
        Update order status — this is exactly what customers see on the Track Order page.
      </p>

      {orders.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-brand-200 p-12 text-center text-ink/50">
          No orders have come in yet.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((o) => {
            const items = o.items;
            return (
              <details key={o.id} className="rounded-2xl border border-brand-100 bg-white">
                <summary className="cursor-pointer list-none p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-mono font-semibold text-brand-800">{o.order_no}</p>
                      <p className="text-xs text-ink/50">
                        {new Date(o.created_at).toLocaleString("en-IN")} · {o.customer_name} · {o.phone}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-brand-100 px-2.5 py-1 font-medium text-brand-700">{o.status}</span>
                      <span
                        className={`rounded-full px-2.5 py-1 font-medium ${
                          o.payment_status === "paid"
                            ? "bg-green-100 text-green-700"
                            : o.payment_status === "failed"
                              ? "bg-red-100 text-red-700"
                              : "bg-gold-400/20 text-gold-600"
                        }`}
                      >
                        {o.payment_method.toUpperCase()} · {o.payment_status}
                      </span>
                      <span className="font-bold text-brand-700">{money(o.total)}</span>
                    </div>
                  </div>
                </summary>

                <div className="grid gap-6 border-t border-brand-100 p-5 lg:grid-cols-3">
                  <div>
                    <h3 className="text-sm font-semibold text-brand-800">Items</h3>
                    <ul className="mt-2 space-y-1.5 text-sm text-ink/70">
                      {items.map((i) => (
                        <li key={i.productId} className="flex justify-between gap-3">
                          <span>{i.name} × {i.qty}</span>
                          <span className="font-medium">{money(i.price * i.qty)}</span>
                        </li>
                      ))}
                    </ul>
                    <dl className="mt-3 space-y-1 border-t border-brand-100 pt-3 text-sm">
                      <div className="flex justify-between"><dt className="text-ink/55">Subtotal</dt><dd>{money(o.subtotal)}</dd></div>
                      {o.discount > 0 && (
                        <div className="flex justify-between text-brand-700">
                          <dt>Discount {o.coupon_code && `(${o.coupon_code})`}</dt><dd>− {money(o.discount)}</dd>
                        </div>
                      )}
                      <div className="flex justify-between"><dt className="text-ink/55">Shipping</dt><dd>{o.shipping ? money(o.shipping) : "FREE"}</dd></div>
                      <div className="flex justify-between font-bold"><dt>Total</dt><dd>{money(o.total)}</dd></div>
                    </dl>
                  </div>

                  <div className="text-sm">
                    <h3 className="font-semibold text-brand-800">Delivery address</h3>
                    <p className="mt-2 leading-relaxed text-ink/70">
                      {o.customer_name}
                      <br />
                      {o.address}
                      <br />
                      {o.city}, {o.state} — {o.pincode}
                      <br />
                      📞 {o.phone}
                      {o.email && <><br />✉️ {o.email}</>}
                    </p>
                    {o.notes && <p className="mt-3 rounded-lg bg-cream p-3 text-xs text-ink/60">Note: {o.notes}</p>}
                    {o.razorpay_payment_id && (
                      <p className="mt-3 text-xs text-ink/45">Razorpay payment: {o.razorpay_payment_id}</p>
                    )}
                    {o.tracking_number && (
                      <p className="mt-2 text-xs text-ink/60">
                        {o.courier || "Courier"}: <strong>{o.tracking_number}</strong>
                      </p>
                    )}
                    <p className="mt-3">
                      <Link
                        href={`/admin/orders/${o.order_no}/invoice`}
                        className="text-xs font-semibold text-brand-600 hover:underline"
                      >
                        Print invoice →
                      </Link>
                    </p>
                  </div>

                  <form action={updateOrderAction} className="h-fit rounded-xl bg-brand-50 p-4">
                    <input type="hidden" name="id" value={o.id} />
                    <input type="hidden" name="order_no" value={o.order_no} />
                    <h3 className="text-sm font-semibold text-brand-800">Update status</h3>

                    <label className="mt-3 block text-xs font-medium">
                      Order status
                      <select
                        name="status"
                        defaultValue={o.status}
                        className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </label>

                    <label className="mt-3 block text-xs font-medium">
                      Payment status
                      <select
                        name="payment_status"
                        defaultValue={o.payment_status}
                        className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm"
                      >
                        {PAYMENT_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </label>

                    <label className="mt-3 block text-xs font-medium">
                      Courier
                      <input
                        name="courier"
                        defaultValue={o.courier}
                        placeholder="Delhivery, Bluedart…"
                        className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm"
                      />
                    </label>

                    <label className="mt-3 block text-xs font-medium">
                      Tracking number
                      <input
                        name="tracking_number"
                        defaultValue={o.tracking_number}
                        placeholder="AWB number"
                        className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm"
                      />
                      <span className="mt-1 block text-[11px] leading-snug text-ink/50">
                        Saving a new tracking number emails the customer automatically.
                      </span>
                    </label>

                    <button
                      type="submit"
                      className="mt-4 w-full rounded-full bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
                    >
                      Update
                    </button>

                    <a
                      href={`https://wa.me/91${o.phone.slice(-10)}?text=${encodeURIComponent(
                        `Hi ${o.customer_name}, an update on your Angad Ayurveda order ${o.order_no}: `
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 block rounded-full border border-brand-300 py-2.5 text-center text-sm font-semibold text-brand-700 hover:bg-white"
                    >
                      WhatsApp customer
                    </a>
                  </form>
                </div>
              </details>
            );
          })}
        </div>
      )}
    </>
  );
}
