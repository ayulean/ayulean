"use client";

import type { CartItem } from "./types";

type Gtag = (...args: unknown[]) => void;
type Fbq = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: Gtag;
    fbq?: Fbq;
  }
}

/**
 * E-commerce events for GA4 and the Meta Pixel.
 *
 * Both are no-ops until the matching env var is set, so nothing here breaks a
 * page when analytics is switched off. The purchase event is what Google and
 * Meta ads actually optimise against, so it has to fire exactly once per order.
 */

function ga(event: string, params: Record<string, unknown>) {
  try {
    window.gtag?.("event", event, params);
  } catch {
    /* analytics must never break the page */
  }
}

function meta(event: string, params: Record<string, unknown>) {
  try {
    window.fbq?.("track", event, params);
  } catch {
    /* ignore */
  }
}

function gaItems(items: CartItem[]) {
  return items.map((i) => ({
    item_id: String(i.productId),
    item_name: i.name,
    price: i.price,
    quantity: i.qty,
  }));
}

export function trackViewItem(item: Omit<CartItem, "qty">) {
  ga("view_item", {
    currency: "INR",
    value: item.price,
    items: gaItems([{ ...item, qty: 1 }]),
  });
  meta("ViewContent", {
    content_ids: [String(item.productId)],
    content_name: item.name,
    content_type: "product",
    value: item.price,
    currency: "INR",
  });
}

export function trackAddToCart(item: Omit<CartItem, "qty">, qty: number) {
  ga("add_to_cart", {
    currency: "INR",
    value: item.price * qty,
    items: gaItems([{ ...item, qty }]),
  });
  meta("AddToCart", {
    content_ids: [String(item.productId)],
    content_name: item.name,
    content_type: "product",
    value: item.price * qty,
    currency: "INR",
  });
}

export function trackBeginCheckout(items: CartItem[], value: number) {
  ga("begin_checkout", { currency: "INR", value, items: gaItems(items) });
  meta("InitiateCheckout", {
    content_ids: items.map((i) => String(i.productId)),
    content_type: "product",
    num_items: items.reduce((n, i) => n + i.qty, 0),
    value,
    currency: "INR",
  });
}

export function trackPurchase(input: {
  orderNo: string;
  items: CartItem[];
  total: number;
  shipping: number;
  coupon: string;
}) {
  // A refresh of the thank-you page must not count as a second sale.
  const key = `ayulean_purchase_${input.orderNo}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    /* private mode — better to risk a duplicate than to lose the conversion */
  }

  ga("purchase", {
    transaction_id: input.orderNo,
    currency: "INR",
    value: input.total,
    shipping: input.shipping,
    coupon: input.coupon || undefined,
    items: gaItems(input.items),
  });
  meta("Purchase", {
    content_ids: input.items.map((i) => String(i.productId)),
    content_type: "product",
    num_items: input.items.reduce((n, i) => n + i.qty, 0),
    value: input.total,
    currency: "INR",
  });
}
