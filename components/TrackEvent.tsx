"use client";

import { useEffect } from "react";
import { trackPurchase, trackViewItem } from "@/lib/track";
import type { CartItem } from "@/lib/types";

/** Fires view_item / ViewContent once when a product page opens. */
export function TrackViewItem({ item }: { item: Omit<CartItem, "qty"> }) {
  useEffect(() => {
    trackViewItem(item);
    // Only re-fire when the visitor moves to a different product.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.productId]);

  return null;
}

/** Fires purchase / Purchase once on the order confirmation page. */
export function TrackPurchase(props: {
  orderNo: string;
  items: CartItem[];
  total: number;
  shipping: number;
  coupon: string;
}) {
  useEffect(() => {
    trackPurchase(props);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.orderNo]);

  return null;
}
