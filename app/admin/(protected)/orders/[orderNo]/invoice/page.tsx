import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PrintButton from "@/components/admin/PrintButton";
import { money } from "@/lib/pricing";
import { getOrderByNo } from "@/lib/queries";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Invoice", robots: { index: false } };

export default async function InvoicePage({ params }: PageProps<"/admin/orders/[orderNo]/invoice">) {
  const { orderNo } = await params;
  const order = await getOrderByNo(orderNo);
  if (!order) notFound();

  // A GST breakup may only be shown by a GST-registered seller. Without a GSTIN
  // this stays a plain invoice — issuing a "Tax Invoice" without registration is
  // an offence under the GST Act.
  const gstRegistered = Boolean(SITE.gstin);
  const gstRate = SITE.gstRate;
  const netOfDiscount = order.subtotal - order.discount;
  const taxable = Math.round(netOfDiscount / (1 + gstRate / 100));
  const tax = netOfDiscount - taxable;

  return (
    <div className="mx-auto max-w-3xl bg-white p-8 text-ink print:p-0">
      <PrintButton />

      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-brand-100 pb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-800">{SITE.name}</h1>
          <p className="mt-1 max-w-xs text-sm leading-relaxed text-ink/65">{SITE.address}</p>
          <p className="mt-1 text-sm text-ink/65">
            {SITE.phone} · {SITE.email}
          </p>
          {SITE.gstin && <p className="mt-1 text-sm text-ink/65">GSTIN: {SITE.gstin}</p>}
        </div>
        <div className="text-right">
          <p className="font-display text-xl font-bold">{gstRegistered ? "TAX INVOICE" : "INVOICE"}</p>
          <p className="mt-1 font-mono text-sm">{order.order_no}</p>
          <p className="text-sm text-ink/60">{new Date(order.created_at).toLocaleDateString("en-IN")}</p>
        </div>
      </header>

      <section className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink/50">Bill to</h2>
          <p className="mt-2 text-sm leading-relaxed">
            <strong>{order.customer_name}</strong>
            <br />
            {order.address}
            <br />
            {order.city}, {order.state} — {order.pincode}
            <br />
            {order.phone}
          </p>
        </div>
        <div className="sm:text-right">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink/50">Payment</h2>
          <p className="mt-2 text-sm leading-relaxed">
            {order.payment_method === "cod" ? "Cash on Delivery" : "Online (Razorpay)"}
            <br />
            Status: {order.payment_status}
            {order.tracking_number && (
              <>
                <br />
                {order.courier || "Courier"}: {order.tracking_number}
              </>
            )}
          </p>
        </div>
      </section>

      <table className="mt-8 w-full text-sm">
        <thead>
          <tr className="border-y border-brand-100 text-left text-xs uppercase text-ink/50">
            <th className="py-2">Item</th>
            <th className="py-2 text-center">Qty</th>
            <th className="py-2 text-right">Rate</th>
            <th className="py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-50">
          {order.items.map((i) => (
            <tr key={i.productId}>
              <td className="py-3">{i.name}</td>
              <td className="py-3 text-center">{i.qty}</td>
              <td className="py-3 text-right">{money(i.price)}</td>
              <td className="py-3 text-right">{money(i.price * i.qty)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        <dl className="w-full max-w-xs space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink/60">Subtotal</dt>
            <dd>{money(order.subtotal)}</dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-brand-700">
              <dt>Discount {order.coupon_code && `(${order.coupon_code})`}</dt>
              <dd>− {money(order.discount)}</dd>
            </div>
          )}
          {gstRegistered && (
            <>
              <div className="flex justify-between text-ink/60">
                <dt>Taxable value</dt>
                <dd>{money(taxable)}</dd>
              </div>
              <div className="flex justify-between text-ink/60">
                <dt>GST @ {gstRate}%</dt>
                <dd>{money(tax)}</dd>
              </div>
            </>
          )}
          <div className="flex justify-between">
            <dt className="text-ink/60">Shipping</dt>
            <dd>{order.shipping === 0 ? "FREE" : money(order.shipping)}</dd>
          </div>
          <div className="flex justify-between border-t border-brand-100 pt-2 text-base font-bold">
            <dt>Total</dt>
            <dd>{money(order.total)}</dd>
          </div>
        </dl>
      </div>

      <footer className="mt-10 border-t border-brand-100 pt-4 text-xs leading-relaxed text-ink/55">
        <p>
          This is a computer-generated invoice and does not require a signature.
          {gstRegistered ? " All prices are inclusive of GST." : ""} Covered by our {SITE.replacementDays}-day
          replacement policy.
        </p>
        {!gstRegistered && (
          <p className="mt-2 print:hidden">
            No GSTIN is set, so this prints as a plain invoice with no tax breakup — correct if you are not yet
            GST registered. Once you have a GSTIN, set <code>NEXT_PUBLIC_GSTIN</code> and it becomes a Tax Invoice
            automatically.
          </p>
        )}
      </footer>
    </div>
  );
}
