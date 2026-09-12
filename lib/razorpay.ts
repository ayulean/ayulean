import crypto from "node:crypto";
import Razorpay from "razorpay";

export const RZP_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
export const RZP_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
export const RZP_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "";

/** Whether the keys are set — when they are not, the site runs in COD-only mode. */
export const onlinePaymentEnabled = Boolean(RZP_KEY_ID && RZP_KEY_SECRET);

/**
 * Whether webhooks are configured. The secret is what proves a call really came
 * from Razorpay, so without it the webhook route rejects everything rather than
 * trusting an unsigned caller who could mark any order as paid.
 */
export const webhookEnabled = Boolean(RZP_WEBHOOK_SECRET);

let client: Razorpay | null = null;
export function razorpay() {
  if (!onlinePaymentEnabled) return null;
  if (!client) client = new Razorpay({ key_id: RZP_KEY_ID, key_secret: RZP_KEY_SECRET });
  return client;
}

/** Constant-time compare of two hex digests. */
function digestsMatch(expected: string, received: string) {
  if (expected.length !== received.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

export function verifySignature(orderId: string, paymentId: string, signature: string) {
  if (!onlinePaymentEnabled) return false;
  const expected = crypto
    .createHmac("sha256", RZP_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return digestsMatch(expected, signature);
}

/**
 * Verify a webhook call.
 *
 * Signed over the raw request body, so the body must be read as text and passed
 * through unparsed — re-serialising the JSON changes the bytes and the
 * signature will never match.
 */
export function verifyWebhookSignature(rawBody: string, signature: string) {
  if (!webhookEnabled || !signature) return false;
  const expected = crypto.createHmac("sha256", RZP_WEBHOOK_SECRET).update(rawBody).digest("hex");
  return digestsMatch(expected, signature);
}
