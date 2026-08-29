import { currentUser } from "@/lib/auth-customer";
import { sendOrderAlert } from "@/lib/notify";
import { cancelBlockedReason, cancelOrder, mayAccessOrder } from "@/lib/orders";
import { getOrderByNo } from "@/lib/queries";
import { allowRequest, clientIp } from "@/lib/ratelimit";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await allowRequest(`cancel:${clientIp(req)}`, 10, 600))) {
    return Response.json({ error: "Too many attempts. Please try again in a few minutes." }, { status: 429 });
  }

  let body: { orderNo?: string; phone?: string; reason?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const orderNo = String(body.orderNo ?? "").trim().toUpperCase();
  const order = orderNo ? await getOrderByNo(orderNo) : null;
  if (!order) return Response.json({ error: "Order not found." }, { status: 404 });

  const user = await currentUser();
  if (!mayAccessOrder(order, { userId: user?.id, phone: body.phone ?? null })) {
    return Response.json(
      { error: "Please log in with the account this order was placed from, or enter the mobile number used." },
      { status: 403 }
    );
  }

  // Fail fast with a friendly message; the real guard is inside the database.
  const blocked = cancelBlockedReason(order.status);
  if (blocked) return Response.json({ error: blocked }, { status: 409 });

  const result = await cancelOrder(orderNo, String(body.reason ?? "").slice(0, 300), "customer");

  if (result === "too_late") {
    // Lost the race: the order shipped between the check above and the update.
    return Response.json(
      { error: "This order has just been shipped, so it can no longer be cancelled." },
      { status: 409 }
    );
  }
  if (result === "already_cancelled") {
    return Response.json({ error: "This order is already cancelled." }, { status: 409 });
  }
  if (result !== "cancelled") {
    return Response.json({ error: "Order not found." }, { status: 404 });
  }

  const updated = await getOrderByNo(orderNo);
  if (updated) void sendOrderAlert(updated);

  const refundNote =
    order.payment_method === "online" && order.payment_status === "paid"
      ? `Your payment of ₹${order.total.toLocaleString("en-IN")} will be refunded to the original payment method within 5–7 working days.`
      : "Nothing was charged, so there is nothing to refund.";

  return Response.json({
    ok: true,
    message: `Order ${orderNo} has been cancelled. ${refundNote} Any questions, call us at ${SITE.phone}.`,
  });
}
