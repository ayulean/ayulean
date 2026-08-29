import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CancelOrderButton from "@/components/CancelOrderButton";
import { TrackPurchase } from "@/components/TrackEvent";
import { money } from "@/lib/pricing";
import { canCancel } from "@/lib/orders";
import { getOrderByNo } from "@/lib/queries";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

export default async function OrderPage({ params }: PageProps<"/order/[orderNo]">) {
  const { orderNo } = await params;
  const order = await getOrderByNo(orderNo);
  if (!order) notFound();

  const items = order.items;
  const paid = order.payment_status === "paid";
  const cancellable = canCancel(order.status);

  return (
    <div className="container-x py-14">
      <TrackPurchase
        orderNo={order.order_no}
        items={items}
        total={order.total}
        shipping={order.shipping}
        coupon={order.coupon_code}
      />

      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-brand-100 bg-gradient-to-b from-brand-50 to-white p-8 text-center">
          <p className="text-5xl" aria-hidden="true">🎉</p>
          <h1 className="mt-4 font-display text-3xl font-bold text-brand-900">Your order is confirmed!</h1>
          <p className="mt-2 text-ink/65">
            Thank you, {order.customer_name}! Your order number is
          </p>
          <p className="mt-2 inline-block rounded-full bg-brand-700 px-5 py-2 font-mono text-lg font-bold text-white">
            {order.order_no}
          </p>
          <p className="mt-4 text-sm text-ink/60">
            {order.payment_method === "cod"
              ? `Payment: Cash on Delivery — please keep ${money(order.total)} ready at the time of delivery.`
              : paid
                ? `Payment: Online — ${money(order.total)} received. Thank you!`
                : "Payment is still pending. If money was deducted, please get in touch with us."}
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-brand-100 p-6">
          <h2 className="font-display text-xl font-bold text-brand-800">Order details</h2>

          <ul className="mt-4 divide-y divide-brand-100">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between py-3 text-sm">
                <span>
                  <span className="font-medium text-ink/85">{i.name}</span>
                  <span className="ml-2 text-ink/55">× {i.qty}</span>
                </span>
                <span className="font-semibold">{money(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-brand-100 pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-ink/60">Subtotal</dt><dd>{money(order.subtotal)}</dd></div>
            {order.discount > 0 && (
              <div className="flex justify-between text-brand-700">
                <dt>Discount {order.coupon_code && `(${order.coupon_code})`}</dt>
                <dd>− {money(order.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-ink/60">Shipping</dt>
              <dd>{order.shipping === 0 ? "FREE" : money(order.shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-brand-100 pt-2 text-base font-bold">
              <dt>Total</dt><dd className="text-brand-700">{money(order.total)}</dd>
            </div>
          </dl>

          <div className="mt-6 rounded-xl bg-cream p-4 text-sm text-ink/70">
            <p className="font-semibold text-brand-800">Delivery address</p>
            <p className="mt-1">
              {order.customer_name}, {order.address}, {order.city}, {order.state} — {order.pincode}
              <br />
              📞 {order.phone}
            </p>
          </div>

          <p className="mt-5 text-sm text-ink/60">
            Order status: <strong className="text-brand-700">{order.status}</strong> · Delivery is expected within
            2–5 working days. The {SITE.replacementDays}-day replacement policy applies.
          </p>
        </div>

        {order.status === "cancelled" && (
          <p className="mt-8 rounded-xl bg-red-50 p-4 text-center text-sm text-red-700">
            This order was cancelled{order.cancelled_at ? ` on ${new Date(order.cancelled_at).toLocaleDateString("en-IN")}` : ""}.
            {order.payment_method === "online" && order.payment_status === "paid"
              ? " Your refund will reach the original payment method within 5–7 working days."
              : ""}
          </p>
        )}

        {cancellable && (
          <div className="mt-8 flex justify-center">
            <CancelOrderButton orderNo={order.order_no} />
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={`/order/${order.order_no}/invoice`}
            className="rounded-full border-2 border-brand-600 px-6 py-3 font-semibold text-brand-700 hover:bg-brand-50"
          >
            Download invoice
          </Link>
          <Link href="/track" className="rounded-full border-2 border-brand-600 px-6 py-3 font-semibold text-brand-700 hover:bg-brand-50">
            Track your order
          </Link>
          <a
            href={`https://wa.me/${SITE.phoneRaw}?text=${encodeURIComponent(`Hi ${SITE.name}, my order number is ${order.order_no}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
          >
            Get help on WhatsApp
          </a>
          <Link
            href={`/replacement?orderNo=${order.order_no}`}
            className="rounded-full px-6 py-3 font-semibold text-brand-700 hover:bg-brand-50"
          >
            Request a replacement
          </Link>
          <Link href="/products" className="rounded-full px-6 py-3 font-semibold text-brand-700 hover:bg-brand-50">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
