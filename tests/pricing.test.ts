import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { applyCoupon, money, shippingFor, subtotalOf } from "@/lib/pricing";
import { SITE } from "@/lib/site";
import type { CartItem, Coupon } from "@/lib/types";

function coupon(overrides: Partial<Coupon> = {}): Coupon {
  return {
    id: 1,
    code: "TEST10",
    type: "percent",
    value: 10,
    min_order: 0,
    max_discount: 0,
    expires_at: null,
    usage_limit: 0,
    per_customer_limit: 0,
    used_count: 0,
    active: true,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

function item(overrides: Partial<CartItem> = {}): CartItem {
  return { productId: 1, slug: "p", name: "P", image: "/i.svg", price: 899, mrp: 1499, qty: 1, ...overrides };
}

describe("subtotalOf", () => {
  it("multiplies price by quantity across items", () => {
    assert.equal(subtotalOf([item({ qty: 2 }), item({ productId: 2, price: 100, qty: 3 })]), 899 * 2 + 300);
  });

  it("is zero for an empty cart", () => {
    assert.equal(subtotalOf([]), 0);
  });
});

describe("shippingFor", () => {
  it("is free at and above the threshold", () => {
    assert.equal(shippingFor(SITE.freeShippingAbove), 0);
    assert.equal(shippingFor(SITE.freeShippingAbove + 1), 0);
  });

  it("charges the flat fee below the threshold", () => {
    assert.equal(shippingFor(SITE.freeShippingAbove - 1), SITE.shippingFee);
  });

  it("charges nothing for an empty cart", () => {
    assert.equal(shippingFor(0), 0);
  });
});

describe("applyCoupon", () => {
  it("rejects an unknown code", () => {
    const r = applyCoupon(null, 1000, "NOPE");
    assert.equal(r.ok, false);
    assert.equal(r.discount, 0);
  });

  it("applies a percentage discount", () => {
    const r = applyCoupon(coupon({ value: 10 }), 1000, "TEST10");
    assert.equal(r.ok, true);
    assert.equal(r.discount, 100);
  });

  it("respects the maximum discount cap", () => {
    const r = applyCoupon(coupon({ value: 50, max_discount: 200 }), 1000, "TEST10");
    assert.equal(r.discount, 200);
  });

  it("applies a flat discount", () => {
    const r = applyCoupon(coupon({ type: "flat", value: 150 }), 1000, "TEST10");
    assert.equal(r.discount, 150);
  });

  it("never discounts more than the subtotal", () => {
    const r = applyCoupon(coupon({ type: "flat", value: 5000 }), 400, "TEST10");
    assert.equal(r.discount, 400);
  });

  it("enforces the minimum order value", () => {
    const r = applyCoupon(coupon({ min_order: 999 }), 500, "TEST10");
    assert.equal(r.ok, false);
    assert.match(r.message, /above/);
  });

  it("rejects an inactive coupon", () => {
    assert.equal(applyCoupon(coupon({ active: false }), 1000, "TEST10").ok, false);
  });

  it("rejects an expired coupon", () => {
    assert.equal(applyCoupon(coupon({ expires_at: "2020-01-01" }), 1000, "TEST10").ok, false);
  });

  it("rejects a coupon that hit its global usage limit", () => {
    assert.equal(applyCoupon(coupon({ usage_limit: 5, used_count: 5 }), 1000, "TEST10").ok, false);
  });

  it("allows a coupon still under its global usage limit", () => {
    assert.equal(applyCoupon(coupon({ usage_limit: 5, used_count: 4 }), 1000, "TEST10").ok, true);
  });

  it("rejects a coupon the same customer already used", () => {
    const r = applyCoupon(coupon({ per_customer_limit: 1 }), 1000, "TEST10", 1);
    assert.equal(r.ok, false);
    assert.match(r.message, /already used/);
  });

  it("allows a first-time use when a per-customer limit exists", () => {
    assert.equal(applyCoupon(coupon({ per_customer_limit: 1 }), 1000, "TEST10", 0).ok, true);
  });
});

describe("money", () => {
  it("formats with the rupee symbol and Indian grouping", () => {
    assert.equal(money(1618), "₹1,618");
    assert.equal(money(100000), "₹1,00,000");
  });
});
