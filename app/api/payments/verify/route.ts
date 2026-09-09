import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { sendOrderAlert, sendOrderConfirmation } from "@/lib/notify";
import { reserveOrderStock } from "@/lib/orders";
import { getOrderByNo } from "@/lib/queries";
import { verifySignature } from "@/lib/razorpay";
import { db } from "@/lib/supabase";

export async function POST(req: Request) {
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const { orderNo, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
  const order = orderNo ? await getOrderByNo(orderNo) : null;
  if (!order) return Response.json({ error: "Order not found." }, { status: 404 });

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
    return Response.json({ error: "Payment details are incomplete." }, { status: 400 });

  if (order.razorpay_order_id !== razorpay_order_id)
    return Response.json({ error: "Order mismatch." }, { status: 400 });

  if (!verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    await db().from("orders").update({ payment_status: "failed" }).eq("order_no", orderNo);
    return Response.json({ error: "We could not verify this payment." }, { status: 400 });
  }

  // The `neq` makes this a single conditional UPDATE, so if two verify calls
  // race (browser handler + a retry), only one of them flips the order to paid
  // and only that one reserves stock.
  const { data: updated, error } = await db()
    .from("orders")
    .update({ payment_status: "paid", status: "placed", razorpay_payment_id })
    .eq("order_no", orderNo)
    .neq("payment_status", "paid")
    .select("id");

  if (error) {
    console.error("Order update failed", error);
    return Response.json({ error: "We could not confirm this payment." }, { status: 500 });
  }

  if (updated && updated.length > 0) {
    await reserveOrderStock(orderNo);
    revalidateTag(CACHE_TAGS.products, "max");

    const saved = await getOrderByNo(orderNo);
    if (saved) void Promise.all([sendOrderConfirmation(saved), sendOrderAlert(saved)]);
  }

  return Response.json({ ok: true, orderNo });
}
