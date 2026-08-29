import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { bundleAvailability, bundleSeparateValue, parseBundleItems } from "@/lib/bundle";

describe("bundleAvailability", () => {
  it("is limited by the scarcest component", () => {
    assert.equal(bundleAvailability([{ qty: 1, stock: 10 }, { qty: 1, stock: 3 }]), 3);
  });

  it("accounts for how many of each the combo needs", () => {
    // 10 units, 3 per combo -> 3 combos
    assert.equal(bundleAvailability([{ qty: 3, stock: 10 }]), 3);
  });

  it("is zero when any component is out of stock", () => {
    assert.equal(bundleAvailability([{ qty: 1, stock: 50 }, { qty: 1, stock: 0 }]), 0);
  });

  it("is zero for a combo with no components", () => {
    assert.equal(bundleAvailability([]), 0);
  });

  it("treats a zero quantity as one rather than dividing by zero", () => {
    assert.equal(bundleAvailability([{ qty: 0, stock: 7 }]), 7);
  });
});

describe("bundleSeparateValue", () => {
  it("adds up each component at its own price", () => {
    assert.equal(bundleSeparateValue([{ qty: 2, price: 899 }, { qty: 1, price: 500 }]), 2298);
  });

  it("is zero for an empty combo", () => {
    assert.equal(bundleSeparateValue([]), 0);
  });
});

describe("parseBundleItems", () => {
  it("keeps valid entries", () => {
    assert.deepEqual(parseBundleItems([{ productId: 1, qty: 2 }]), [{ productId: 1, qty: 2 }]);
  });

  it("merges duplicates of the same product", () => {
    assert.deepEqual(parseBundleItems([{ productId: 1, qty: 2 }, { productId: 1, qty: 3 }]), [
      { productId: 1, qty: 5 },
    ]);
  });

  it("drops entries with a bad id or quantity", () => {
    assert.deepEqual(
      parseBundleItems([
        { productId: 0, qty: 1 },
        { productId: 2, qty: 0 },
        { productId: 3, qty: -4 },
        { productId: 4, qty: 1 },
      ]),
      [{ productId: 4, qty: 1 }]
    );
  });

  it("caps a runaway quantity", () => {
    assert.deepEqual(parseBundleItems([{ productId: 1, qty: 9999 }]), [{ productId: 1, qty: 50 }]);
  });

  it("returns an empty list for anything that is not an array", () => {
    assert.deepEqual(parseBundleItems(null), []);
    assert.deepEqual(parseBundleItems("nope"), []);
    assert.deepEqual(parseBundleItems([1, "x", null]), []);
  });
});
