import { markOrderPaid, markOrderPaymentFailed } from "@/lib/payments";
import { getOrderByNo } from "@/lib/queries";
import { verifySignature } from "@/lib/razorpay";

/**
 * The browser's report of a successful payment, sent from the Razorpay checkout
 * handler. It is the fast path — the customer is waiting on the thank-you page.
 * `/api/payments/webhook` covers the same ground for a browser that never came
 * back, and the two are safe to run against the same order.
 */
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
    await markOrderPaymentFailed(orderNo);
    return Response.json({ error: "We could not verify this payment." }, { status: 400 });
  }

  try {
    await markOrderPaid(orderNo, razorpay_payment_id);
  } catch (err) {
    console.error("Order update failed", err);
    return Response.json({ error: "We could not confirm this payment." }, { status: 500 });
  }

  return Response.json({ ok: true, orderNo });
}
