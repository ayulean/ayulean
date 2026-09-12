import assert from "node:assert/strict";
import crypto from "node:crypto";
import { beforeAll, describe, it } from "vitest";

const KEY_SECRET = "key-secret-for-tests";
const WEBHOOK_SECRET = "webhook-secret-for-tests";

type RazorpayLib = typeof import("@/lib/razorpay");
let lib: RazorpayLib;

// The module reads its secrets once, at import time, so the environment has to
// be in place before the import rather than before each test.
beforeAll(async () => {
  process.env.RAZORPAY_KEY_ID = "rzp_test_key_id";
  process.env.RAZORPAY_KEY_SECRET = KEY_SECRET;
  process.env.RAZORPAY_WEBHOOK_SECRET = WEBHOOK_SECRET;
  lib = await import("@/lib/razorpay");
});

const hmac = (secret: string, payload: string) =>
  crypto.createHmac("sha256", secret).update(payload).digest("hex");

describe("verifySignature", () => {
  it("accepts the signature Razorpay sends for a payment", () => {
    const sig = hmac(KEY_SECRET, "order_ABC|pay_XYZ");
    assert.equal(lib.verifySignature("order_ABC", "pay_XYZ", sig), true);
  });

  it("rejects a signature made for a different payment", () => {
    const sig = hmac(KEY_SECRET, "order_ABC|pay_OTHER");
    assert.equal(lib.verifySignature("order_ABC", "pay_XYZ", sig), false);
  });

  it("rejects a signature signed with the wrong secret", () => {
    const sig = hmac("not-the-secret", "order_ABC|pay_XYZ");
    assert.equal(lib.verifySignature("order_ABC", "pay_XYZ", sig), false);
  });
});

describe("verifyWebhookSignature", () => {
  const body = JSON.stringify({ event: "payment.captured", payload: { payment: { entity: { id: "pay_1" } } } });

  it("accepts a body signed with the webhook secret", () => {
    assert.equal(lib.verifyWebhookSignature(body, hmac(WEBHOOK_SECRET, body)), true);
  });

  it("rejects a body that was altered after signing", () => {
    const sig = hmac(WEBHOOK_SECRET, body);
    const tampered = body.replace("pay_1", "pay_2");
    assert.equal(lib.verifyWebhookSignature(tampered, sig), false);
  });

  it("rejects a body signed with the API key secret instead of the webhook secret", () => {
    assert.equal(lib.verifyWebhookSignature(body, hmac(KEY_SECRET, body)), false);
  });

  it("rejects a missing signature rather than treating it as unsigned-but-fine", () => {
    assert.equal(lib.verifyWebhookSignature(body, ""), false);
  });

  it("rejects a truncated signature without throwing", () => {
    const sig = hmac(WEBHOOK_SECRET, body);
    assert.equal(lib.verifyWebhookSignature(body, sig.slice(0, 32)), false);
  });

  it("is sensitive to whitespace, so a re-serialised body will not pass", () => {
    // Why the route verifies the raw text and only then parses it.
    const sig = hmac(WEBHOOK_SECRET, body);
    const reserialised = JSON.stringify(JSON.parse(body), null, 2);
    assert.equal(lib.verifyWebhookSignature(reserialised, sig), false);
  });
});
