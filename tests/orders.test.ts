import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { canCancel, cancelBlockedReason, mayAccessOrder, orderNumber } from "@/lib/orders";

describe("orderNumber", () => {
  it("uses the AYU prefix with a date stamp and 5 random digits", () => {
    assert.match(orderNumber(), /^AYU\d{8}\d{5}$/);
  });

  it("does not collide across a large batch", () => {
    const seen = new Set(Array.from({ length: 500 }, orderNumber));
    // 90,000 possible suffixes per day — a handful of collisions is expected,
    // but the order_no column is UNIQUE so a duplicate insert would be rejected.
    assert.ok(seen.size > 480, `expected mostly unique numbers, got ${seen.size}/500`);
  });
});

describe("canCancel", () => {
  it("allows cancelling an order that has not shipped", () => {
    assert.equal(canCancel("placed"), true);
    assert.equal(canCancel("confirmed"), true);
    assert.equal(canCancel("pending_payment"), true);
  });

  it("refuses once the order has shipped", () => {
    assert.equal(canCancel("shipped"), false);
    assert.equal(canCancel("delivered"), false);
  });

  it("refuses for cancelled and replacement orders", () => {
    assert.equal(canCancel("cancelled"), false);
    assert.equal(canCancel("replacement"), false);
  });

  it("refuses an unknown status rather than guessing", () => {
    assert.equal(canCancel("something-new"), false);
  });
});

describe("cancelBlockedReason", () => {
  it("is null while the order can still be cancelled", () => {
    assert.equal(cancelBlockedReason("placed"), null);
  });

  it("explains a shipped order in plain words", () => {
    assert.match(String(cancelBlockedReason("shipped")), /already been shipped/);
  });

  it("explains an already-cancelled order", () => {
    assert.match(String(cancelBlockedReason("cancelled")), /already cancelled/);
  });
});

describe("mayAccessOrder", () => {
  const order = { user_id: "user-1", phone: "9876543210" } as never as Parameters<typeof mayAccessOrder>[0];

  it("allows the signed-in owner", () => {
    assert.equal(mayAccessOrder(order, { userId: "user-1" }), true);
  });

  it("refuses a different signed-in customer", () => {
    assert.equal(mayAccessOrder(order, { userId: "user-2" }), false);
  });

  it("allows someone who knows the order's phone number", () => {
    assert.equal(mayAccessOrder(order, { phone: "9876543210" }), true);
    assert.equal(mayAccessOrder(order, { phone: "+91 98765 43210" }), true);
  });

  it("refuses a wrong phone number", () => {
    assert.equal(mayAccessOrder(order, { phone: "9999999999" }), false);
  });

  it("refuses a partial phone number rather than matching loosely", () => {
    assert.equal(mayAccessOrder(order, { phone: "3210" }), false);
  });

  it("refuses when nothing is offered", () => {
    assert.equal(mayAccessOrder(order, {}), false);
  });
});
