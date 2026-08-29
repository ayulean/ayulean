import { SITE } from "./site";
import type { CartItem, Coupon } from "./types";

export function subtotalOf(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}

export function shippingFor(subtotal: number) {
  if (subtotal <= 0) return 0;
  return subtotal >= SITE.freeShippingAbove ? 0 : SITE.shippingFee;
}

export type CouponCheck =
  | { ok: true; discount: number; code: string; message: string }
  | { ok: false; discount: 0; code: string; message: string };

export function applyCoupon(
  coupon: Coupon | null,
  subtotal: number,
  code: string,
  customerUses = 0
): CouponCheck {
  if (!coupon) return { ok: false, discount: 0, code, message: "This coupon code is not valid." };
  if (!coupon.active) return { ok: false, discount: 0, code, message: "This coupon is not active right now." };
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date())
    return { ok: false, discount: 0, code, message: "This coupon has expired." };
  if (coupon.usage_limit > 0 && coupon.used_count >= coupon.usage_limit)
    return { ok: false, discount: 0, code, message: "This coupon has reached its usage limit." };
  if (coupon.per_customer_limit > 0 && customerUses >= coupon.per_customer_limit)
    return {
      ok: false,
      discount: 0,
      code,
      message: `You have already used this coupon ${coupon.per_customer_limit === 1 ? "once" : `${coupon.per_customer_limit} times`}.`,
    };
  if (subtotal < coupon.min_order)
    return {
      ok: false,
      discount: 0,
      code,
      message: `This coupon applies to orders above ${SITE.currency}${coupon.min_order}.`,
    };

  let discount = coupon.type === "percent" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  if (coupon.max_discount > 0) discount = Math.min(discount, coupon.max_discount);
  discount = Math.min(discount, subtotal);

  return { ok: true, discount, code: coupon.code, message: `${SITE.currency}${discount} discount applied!` };
}

export function money(n: number) {
  return `${SITE.currency}${n.toLocaleString("en-IN")}`;
}
