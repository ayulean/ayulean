import { markOrderPaid, markOrderPaymentFailed } from "@/lib/payments";
import { verifyWebhookSignature, webhookEnabled } from "@/lib/razorpay";
import { db } from "@/lib/supabase";

/**
 * Razorpay's own report of what happened to a payment.
 *
 * `/api/payments/verify` only ever hears from the customer's browser, so a
 * closed tab, a dropped connection or a UPI app that never returns leaves an
 * order sitting at `pending_payment` while the money is already collected.
 * Razorpay calls this route instead — server to server, and retried until it
 * gets a 2xx — so confirmation no longer depends on the browser coming back.
 *
 * Because of those retries every branch here must be safe to run twice, and
 * anything we cannot act on must still answer 2xx or Razorpay keeps redelivering
 * it for a day.
 */

type Entity = { id?: string; order_id?: string };
type WebhookBody = {
  event?: string;
  payload?: { payment?: { entity?: Entity }; order?: { entity?: Entity } };
};

const PAID_EVENTS = ["payment.captured", "order.paid"];

export async function POST(req: Request) {
  if (!webhookEnabled) {
    console.error("Razorpay webhook called but RAZORPAY_WEBHOOK_SECRET is not set");
    return Response.json({ error: "Webhooks are not configured." }, { status: 503 });
  }

  // Signed over the exact bytes Razorpay sent, so read the body as text and
  // verify it before parsing anything out of it.
  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  if (!verifyWebhookSignature(raw, signature)) {
    console.error("Razorpay webhook signature did not match");
    return Response.json({ error: "Invalid signature." }, { status: 400 });
  }

  let body: WebhookBody;
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Invalid payload." }, { status: 400 });
  }

  const event = body.event ?? "";
  const isPaid = PAID_EVENTS.includes(event);
  if (!isPaid && event !== "payment.failed") {
    // Subscriptions, refunds, settlements — nothing for this store to do.
    return Response.json({ ok: true, ignored: event });
  }

  const payment = body.payload?.payment?.entity;
  const rzpOrderId = payment?.order_id || body.payload?.order?.entity?.id || "";
  if (!rzpOrderId) {
    console.error("Razorpay webhook", event, "carried no order id");
    return Response.json({ ok: true, ignored: event });
  }

  const { data, error } = await db()
    .from("orders")
    .select("order_no")
    .eq("razorpay_order_id", rzpOrderId)
    .limit(1);

  // A lookup that failed is worth retrying, so answer 5xx and let Razorpay
  // deliver it again.
  if (error) {
    console.error("Order lookup failed for", rzpOrderId, error);
    return Response.json({ error: "Lookup failed." }, { status: 500 });
  }

  const orderNo = data?.[0]?.order_no;
  if (!orderNo) {
    // Another site or a test event on the same Razorpay account. Retrying will
    // never find it, so accept it and move on.
    console.error("No order matches Razorpay order", rzpOrderId);
    return Response.json({ ok: true, unmatched: rzpOrderId });
  }

  try {
    if (isPaid) {
      const confirmed = await markOrderPaid(orderNo, payment?.id ?? "");
      return Response.json({ ok: true, orderNo, confirmed });
    }

    await markOrderPaymentFailed(orderNo);
    return Response.json({ ok: true, orderNo, failed: true });
  } catch (err) {
    console.error("Razorpay webhook", event, "failed for", orderNo, err);
    return Response.json({ error: "Could not record this payment." }, { status: 500 });
  }
}
