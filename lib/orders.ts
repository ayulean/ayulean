import { db } from "./supabase";
import type { Order } from "./types";

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

/** Statuses a customer may still cancel from. Once it ships, it is with the courier. */
export const CANCELLABLE_STATUSES = ["placed", "confirmed", "pending_payment"] as const;

export function canCancel(status: string): boolean {
  return (CANCELLABLE_STATUSES as readonly string[]).includes(status);
}

/** Plain-English reason a given order cannot be cancelled. */
export function cancelBlockedReason(status: string): string | null {
  if (canCancel(status)) return null;
  if (status === "cancelled") return "This order is already cancelled.";
  if (status === "shipped") return "This order has already been shipped, so it can no longer be cancelled.";
  if (status === "delivered") return "This order has already been delivered.";
  if (status === "replacement") return "A replacement is already being processed for this order.";
  return "This order can no longer be cancelled.";
}

export type CancelResult = "cancelled" | "not_found" | "too_late" | "already_cancelled";

/**
 * Cancels an order and puts its stock back.
 *
 * The status check happens inside Postgres under a row lock, so a customer
 * cancelling at the same moment the admin marks it shipped cannot both succeed.
 */
export async function cancelOrder(
  orderNo: string,
  reason: string,
  by: "customer" | "admin"
): Promise<CancelResult> {
  const { data, error } = await db().rpc("cancel_order", {
    p_order_no: orderNo,
    p_reason: reason,
    p_by: by,
  });
  if (error) throw new Error(`Failed to cancel ${orderNo}: ${error.message}`);

  const result = (data ?? "not_found") as CancelResult;
  if (result === "cancelled") await releaseOrderStock(orderNo);
  return result;
}

/**
 * Whether this visitor is allowed to see or act on an order: either they are
 * the signed-in owner, or they can quote the phone number it was placed with.
 */
export function mayAccessOrder(order: Order, opts: { userId?: string | null; phone?: string | null }): boolean {
  if (opts.userId && order.user_id === opts.userId) return true;

  const given = (opts.phone ?? "").replace(/\D/g, "");
  if (given.length < 10) return false;
  return order.phone.replace(/\D/g, "").endsWith(given.slice(-10));
}
