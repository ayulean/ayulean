import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { containsLink, shouldAutoApprove } from "@/lib/reviews";

describe("containsLink", () => {
  it("catches full URLs", () => {
    assert.equal(containsLink("visit https://spam.example for deals"), true);
    assert.equal(containsLink("http://cheap.pills"), true);
  });

  it("catches www and bare domains", () => {
    assert.equal(containsLink("go to www.spam.com"), true);
    assert.equal(containsLink("order at buycheap.shop today"), true);
    assert.equal(containsLink("join t.me/spamgroup"), true);
  });

  it("catches embedded HTML anchors", () => {
    assert.equal(containsLink('<a href="/x">click</a>'), true);
  });

  it("leaves a normal review alone", () => {
    assert.equal(containsLink("Great product, my digestion improved in 3 weeks."), false);
    assert.equal(containsLink("Taste is a bit herbal but results are good. 5 stars!"), false);
  });

  it("does not trip on ordinary sentence punctuation", () => {
    assert.equal(containsLink("Works well. Delivery was fast. Will buy again."), false);
    assert.equal(containsLink("Took it for 2 months.Result is visible."), false);
  });
});

describe("shouldAutoApprove", () => {
  it("publishes a genuine review straight away", () => {
    assert.equal(
      shouldAutoApprove({ name: "Priya", title: "Very good", body: "Helped my digestion a lot." }),
      true
    );
  });

  it("holds a review with a link in the body", () => {
    assert.equal(shouldAutoApprove({ name: "Priya", title: "Nice", body: "Buy at spam.shop" }), false);
  });

  it("holds a link hidden in the title or the name", () => {
    assert.equal(shouldAutoApprove({ name: "Priya", title: "see spam.xyz", body: "Good." }), false);
    assert.equal(shouldAutoApprove({ name: "www.spam.com", title: "Nice", body: "Good." }), false);
  });
});
