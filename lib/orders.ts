import { db } from "./supabase";

/**
 * Deduct stock and count the coupon for a confirmed order.
 * The Postgres function is guarded by orders.stock_reserved, so calling this
 * twice (a retry, a double webhook) can never move stock twice.
 */
export async function reserveOrderStock(orderNo: string) {
  const { error } = await db().rpc("reserve_order_stock", { p_order_no: orderNo });
  if (error) throw new Error(`Failed to reserve stock for ${orderNo}: ${error.message}`);
}

/** Put stock and coupon usage back — used when an order is cancelled. */
export async function releaseOrderStock(orderNo: string) {
  const { error } = await db().rpc("release_order_stock", { p_order_no: orderNo });
  if (error) throw new Error(`Failed to release stock for ${orderNo}: ${error.message}`);
}

/** How many times this phone number has already used a coupon. */
export async function couponUsesByPhone(code: string, phone: string): Promise<number> {
  const { data, error } = await db().rpc("coupon_uses_by_phone", { p_code: code, p_phone: phone });
  if (error) {
    console.error("Coupon usage lookup failed", error);
    return 0;
  }
  return Number(data ?? 0);
}

export function orderNumber() {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(Math.random() * 90000 + 10000);
  return `AYU${stamp}${rand}`;
}
