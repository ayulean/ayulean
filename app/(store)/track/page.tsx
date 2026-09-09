import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import CancelOrderButton from "@/components/CancelOrderButton";
import { canCancel } from "@/lib/orders";
import { money } from "@/lib/pricing";
import ReplacementStatusCard from "@/components/ReplacementStatusCard";
import { getOrderByNo, getReplacementForOrder } from "@/lib/queries";
import { SITE } from "@/lib/site";
import Icon from "@/components/Icon";

export const metadata: Metadata = { title: "Track Order" };

const STEPS = ["placed", "confirmed", "shipped", "delivered"];

/**
 * The heading is prerendered and shown at once; the lookup form and whatever it
 * found are the only parts that wait on the query string and the database.
 */
export default function TrackPage({ searchParams }: PageProps<"/track">) {
  return (
    <div className="container-x py-14">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-brand-900">Track your order</h1>
        <p className="mt-2 text-ink/60">Enter your order number and the mobile number you ordered with.</p>

        <Suspense fallback={<TrackFormSkeleton />}>
          <Lookup searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

function TrackFormSkeleton() {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
      <div className="skeleton h-12 rounded-lg" />
      <div className="skeleton h-12 rounded-lg" />
      <div className="skeleton h-12 w-28 rounded-lg" />
    </div>
  );
}

async function Lookup({ searchParams }: Pick<PageProps<"/track">, "searchParams">) {
  const sp = await searchParams;
  const orderNo = typeof sp.orderNo === "string" ? sp.orderNo.trim() : "";
  const phone = typeof sp.phone === "string" ? sp.phone.replace(/\s/g, "") : "";

  const order = orderNo ? await getOrderByNo(orderNo) : null;
  // Details are shown only when both the order number and the registered phone match.
  const matched = order && phone && order.phone.endsWith(phone.slice(-10)) ? order : null;
  const searched = Boolean(orderNo && phone);
  const replacement = matched ? await getReplacementForOrder(matched.order_no) : null;

  return (
    <>
        <form method="get" className="mt-6 grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
          <input
            name="orderNo"
            defaultValue={orderNo}
            required
            placeholder="AYU2026XXXXXXX"
            className="rounded-lg border border-brand-200 px-3 py-3 uppercase"
          />
          <input
            name="phone"
            defaultValue={phone}
            required
            inputMode="numeric"
            placeholder="Mobile number"
            className="rounded-lg border border-brand-200 px-3 py-3"
          />
          <button type="submit" className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700">
            Track
          </button>
        </form>

        {searched && !matched && (
          <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            We could not find an order with that order number and mobile number. Please check the details or call us
            at {SITE.phone}.
          </p>
        )}

        {matched && (
          <div className="mt-8 rounded-card border border-line p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-xl font-bold text-brand-800">{matched.order_no}</h2>
              <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-700">
                {matched.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-ink/55">
              {new Date(matched.created_at).toLocaleString("en-IN")} · {matched.payment_method === "cod" ? "Cash on Delivery" : "Online payment"} ·{" "}
              {matched.payment_status}
            </p>

            {matched.status !== "cancelled" && (
              <ol className="mt-6 flex items-center">
                {STEPS.map((s, idx) => {
                  const current = STEPS.indexOf(matched.status);
                  const done = current >= idx;
                  return (
                    <li key={s} className="flex flex-1 items-center last:flex-none">
                      <div className="flex flex-col items-center">
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                            done ? "bg-brand-600 text-white" : "bg-brand-100 text-brand-400"
                          }`}
                        >
                          {done ? <Icon name="check" size={15} strokeWidth={3} /> : idx + 1}
                        </span>
                        <span className="mt-2 text-xs capitalize text-ink/60">{s}</span>
                      </div>
                      {idx < STEPS.length - 1 && (
                        <span className={`mx-1 h-0.5 flex-1 ${done ? "bg-brand-500" : "bg-brand-100"}`} />
                      )}
                    </li>
                  );
                })}
              </ol>
            )}

            <ul className="mt-6 divide-y divide-line">
              {matched.items.map((i) => (
                <li key={i.productId} className="flex justify-between py-3 text-sm">
                  <span>{i.name} × {i.qty}</span>
                  <span className="font-semibold">{money(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-right font-bold text-brand-700">Total: {money(matched.total)}</p>

            {matched.tracking_number && (
              <p className="mt-4 rounded-xl bg-brand-50 p-4 text-sm text-ink/75">
                Shipped via <strong>{matched.courier || "our courier partner"}</strong> · Tracking number:{" "}
                <strong className="font-mono">{matched.tracking_number}</strong>
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/order/${matched.order_no}/invoice?phone=${encodeURIComponent(phone)}`}
                className="rounded-full border-2 border-brand-600 px-5 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
              >
                Download invoice
              </Link>
              <Link
                href={`/replacement?orderNo=${matched.order_no}`}
                className="rounded-full border-2 border-brand-600 px-5 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
              >
                Request a replacement
              </Link>
              <a
                href={`https://wa.me/${SITE.phoneRaw}?text=${encodeURIComponent(`Hi ${SITE.name}, my order number is ${matched.order_no}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
              >
                Get help on WhatsApp
              </a>
            </div>

            {canCancel(matched.status) && (
              <div className="mt-5">
                <CancelOrderButton orderNo={matched.order_no} phone={phone} />
              </div>
            )}

            {replacement && (
              <div className="mt-5">
                <ReplacementStatusCard request={replacement} />
              </div>
            )}

            {matched.status === "cancelled" && (
              <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                This order was cancelled
                {matched.cancelled_at ? ` on ${new Date(matched.cancelled_at).toLocaleDateString("en-IN")}` : ""}.
              </p>
            )}
          </div>
        )}
    </>
  );
}
