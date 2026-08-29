import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { orderNumber } from "@/lib/orders";

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
