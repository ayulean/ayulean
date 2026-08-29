import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Invoice from "@/components/Invoice";
import { getOrderByNo } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Invoice", robots: { index: false } };

export default async function AdminInvoicePage({ params }: PageProps<"/admin/orders/[orderNo]/invoice">) {
  const { orderNo } = await params;
  const order = await getOrderByNo(orderNo);
  if (!order) notFound();

  return <Invoice order={order} />;
}
