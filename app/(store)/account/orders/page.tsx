import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AccountsDisabled from "@/components/account/AccountsDisabled";
import CancelOrderButton from "@/components/CancelOrderButton";
import ReplacementStatusCard from "@/components/ReplacementStatusCard";
import { accountsEnabled, currentUser, customerClient } from "@/lib/auth-customer";
import { canCancel } from "@/lib/orders";
import { getReplacementsByOrderNos } from "@/lib/queries";
import { money } from "@/lib/pricing";
import { SITE } from "@/lib/site";
import type { Order } from "@/lib/types";

/**
 * A personal page: it exists only for the signed-in customer, or for one
 * specific order. There is no shared shell worth prerendering, so it blocks on
 * the server rather than streaming an empty frame first.
 */
export const instant = false;

export const metadata: Metadata = { title: "My orders", robots: { index: false } };

export default async function MyOrdersPage() {
  if (!accountsEnabled) return <AccountsDisabled />;

  const user = await currentUser();
  if (!user) redirect("/account/login?next=/account/orders");

  // Row level security limits this to the signed-in customer's own orders.
  const supabase = await customerClient();
  const { data } = await supabase.from("orders").select("*").order("id", { ascending: false });
  const orders = (data ?? []) as Order[];
  const replacements = await getReplacementsByOrderNos(orders.map((o) => o.order_no));

  return (
    <div className="container-x py-14">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-3xl font-bold text-brand-900">My orders</h1>
          <Link href="/account" className="text-sm text-brand-700 hover:underline">
            Back to account
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-brand-200 p-12 text-center">
            <p className="text-ink/60">You have not placed an order yet.</p>
            <Link
              href="/products"
              className="btn btn-primary mt-5"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((o) => (
              <article key={o.id} className="rounded-card border border-line p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono font-semibold text-brand-800">{o.order_no}</p>
                    <p className="text-xs text-ink/50">
                      {new Date(o.created_at).toLocaleDateString("en-IN")} ·{" "}
                      {o.payment_method === "cod" ? "Cash on Delivery" : "Paid online"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        o.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : o.status === "delivered"
                            ? "bg-brand-600 text-white"
                            : "bg-brand-100 text-brand-700"
                      }`}
                    >
                      {o.status}
                    </span>
                    <span className="font-bold text-brand-700">{money(o.total)}</span>
                  </div>
                </div>

                <ul className="mt-3 text-sm text-ink/70">
                  {o.items.map((i) => (
                    <li key={i.productId}>
                      {i.name} × {i.qty}
                    </li>
                  ))}
                </ul>

                {o.tracking_number && (
                  <p className="mt-3 rounded-lg bg-brand-50 p-3 text-sm text-ink/75">
                    {o.courier || "Courier"} · Tracking: <strong className="font-mono">{o.tracking_number}</strong>
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                  <Link href={`/order/${o.order_no}`} className="text-brand-700 hover:underline">
                    View details
                  </Link>
                  <Link href={`/order/${o.order_no}/invoice`} className="text-brand-700 hover:underline">
                    Invoice
                  </Link>
                  <Link href={`/replacement?orderNo=${o.order_no}`} className="text-brand-700 hover:underline">
                    Request a replacement
                  </Link>
                  <a
                    href={`https://wa.me/${SITE.phoneRaw}?text=${encodeURIComponent(`Hi ${SITE.name}, my order number is ${o.order_no}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-700 hover:underline"
                  >
                    Get help
                  </a>
                  {canCancel(o.status) && <CancelOrderButton orderNo={o.order_no} />}
                </div>

                {replacements.has(o.order_no) && (
                  <div className="mt-4">
                    <ReplacementStatusCard request={replacements.get(o.order_no)!} />
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
