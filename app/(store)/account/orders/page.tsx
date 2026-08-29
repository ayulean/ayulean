import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AccountsDisabled from "@/components/account/AccountsDisabled";
import { accountsEnabled, currentUser, customerClient } from "@/lib/auth-customer";
import { money } from "@/lib/pricing";
import { SITE } from "@/lib/site";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "My orders", robots: { index: false } };

export default async function MyOrdersPage() {
  if (!accountsEnabled) return <AccountsDisabled />;

  const user = await currentUser();
  if (!user) redirect("/account/login?next=/account/orders");

  // Row level security limits this to the signed-in customer's own orders.
  const supabase = await customerClient();
  const { data } = await supabase.from("orders").select("*").order("id", { ascending: false });
  const orders = (data ?? []) as Order[];

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
              className="mt-5 inline-block rounded-full bg-brand-600 px-8 py-3 font-semibold text-white hover:bg-brand-700"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((o) => (
              <article key={o.id} className="rounded-2xl border border-brand-100 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono font-semibold text-brand-800">{o.order_no}</p>
                    <p className="text-xs text-ink/50">
                      {new Date(o.created_at).toLocaleDateString("en-IN")} ·{" "}
                      {o.payment_method === "cod" ? "Cash on Delivery" : "Paid online"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700">
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

                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                  <Link href={`/order/${o.order_no}`} className="text-brand-700 hover:underline">
                    View details
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
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
