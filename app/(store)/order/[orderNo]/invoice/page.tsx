import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Invoice from "@/components/Invoice";
import { currentUser } from "@/lib/auth-customer";
import { mayAccessOrder } from "@/lib/orders";
import { getOrderByNo } from "@/lib/queries";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Your invoice", robots: { index: false } };

export default async function CustomerInvoicePage({ params, searchParams }: PageProps<"/order/[orderNo]/invoice">) {
  const { orderNo } = await params;
  const sp = await searchParams;

  const order = await getOrderByNo(orderNo);
  if (!order) notFound();

  // Either the signed-in owner, or someone who can quote the order's phone number.
  const user = await currentUser();
  const phone = typeof sp.phone === "string" ? sp.phone : null;

  if (!mayAccessOrder(order, { userId: user?.id, phone })) {
    return (
      <div className="container-x py-20">
        <div className="mx-auto max-w-md rounded-2xl border border-brand-100 bg-cream p-8 text-center">
          <h1 className="font-display text-2xl font-bold text-brand-800">Invoice not available</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink/65">
            To open this invoice, either log in to the account the order was placed with, or open it from the
            Track Order page using your order number and mobile number.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/account/login"
              className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Log in
            </Link>
            <Link
              href="/track"
              className="rounded-full border border-brand-300 px-6 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
            >
              Track order
            </Link>
          </div>
          <p className="mt-5 text-xs text-ink/50">Need help? Call us at {SITE.phone}.</p>
        </div>
      </div>
    );
  }

  return <Invoice order={order} />;
}
