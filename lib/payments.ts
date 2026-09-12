import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "./cache-tags";
import { sendOrderAlert, sendOrderConfirmation } from "./notify";
import { reserveOrderStock } from "./orders";
import { getOrderByNo } from "./queries";
import { db } from "./supabase";

/**
 * What happens to an order once Razorpay says the money arrived.
 *
 * Two independent callers can report the same payment: the browser, right after
 * the checkout popup closes, and the webhook, which Razorpay retries until it
 * gets a 2xx. Both land here so a payment is confirmed exactly once no matter
 * which one wins the race, or whether the customer's browser ever came back.
 */

/**
 * Flip an order to paid. Returns true only for the call that actually made the
 * change, so stock, emails and cache expiry happen once and not once per retry.
 */
export async function markOrderPaid(orderNo: string, paymentId: string): Promise<boolean> {
  // The `neq` makes this a single conditional UPDATE, so if two calls race
  // (browser handler + webhook), only one of them flips the order to paid.
  const { data, error } = await db()
    .from("orders")
    .update({ payment_status: "paid", status: "placed", razorpay_payment_id: paymentId })
    .eq("order_no", orderNo)
    .neq("payment_status", "paid")
    .select("id");

  if (error) throw new Error(`Failed to mark ${orderNo} paid: ${error.message}`);
  if (!data || data.length === 0) return false;

  try {
    await reserveOrderStock(orderNo);
    revalidateTag(CACHE_TAGS.products, "max");
  } catch (err) {
    // The money is in and the order is saved — never fail a paid order over a
    // stock counter. Retrying would not help either: the order is already paid,
    // so a second call takes the `neq` branch and never reaches this line.
    console.error("Stock reservation failed for", orderNo, err);
  }

  const saved = await getOrderByNo(orderNo);
  // Fire and forget: a slow mail server must not hold up the thank-you page.
  if (saved) void Promise.all([sendOrderConfirmation(saved), sendOrderAlert(saved)]);

  return true;
}

/**
 * Record a failed payment. Guarded against a late failure event overwriting an
 * order that a retry has already paid for.
 */
export async function markOrderPaymentFailed(orderNo: string): Promise<void> {
  const { error } = await db()
    .from("orders")
    .update({ payment_status: "failed" })
    .eq("order_no", orderNo)
    .neq("payment_status", "paid");

  if (error) console.error("Failed to mark", orderNo, "as failed", error);
}
