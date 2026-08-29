import crypto from "node:crypto";
import Razorpay from "razorpay";

export const RZP_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
export const RZP_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

/** Whether the keys are set — when they are not, the site runs in COD-only mode. */
export const onlinePaymentEnabled = Boolean(RZP_KEY_ID && RZP_KEY_SECRET);

let client: Razorpay | null = null;
export function razorpay() {
  if (!onlinePaymentEnabled) return null;
  if (!client) client = new Razorpay({ key_id: RZP_KEY_ID, key_secret: RZP_KEY_SECRET });
  return client;
}

export function verifySignature(orderId: string, paymentId: string, signature: string) {
  if (!onlinePaymentEnabled) return false;
  const expected = crypto
    .createHmac("sha256", RZP_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
