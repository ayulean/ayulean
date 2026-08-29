import { sendReplacementAlert } from "@/lib/notify";
import { getOrderByNo } from "@/lib/queries";
import { allowRequest, clientIp } from "@/lib/ratelimit";
import { SITE } from "@/lib/site";
import { db } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const REASONS = ["Damaged or leaked", "Seal broken / tampered", "Wrong product received", "Expired product", "Other"];

export async function POST(req: Request) {
  if (!(await allowRequest(`replacement:${clientIp(req)}`, 5, 3600))) {
    return Response.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const orderNo = String(body.orderNo ?? "").trim().toUpperCase();
  const phone = String(body.phone ?? "").replace(/\D/g, "");
  const reason = String(body.reason ?? "").trim();
  const details = String(body.details ?? "").trim();

  const order = orderNo ? await getOrderByNo(orderNo) : null;
  if (!order || !order.phone.endsWith(phone.slice(-10)))
    return Response.json(
      { error: "We could not find an order with that order number and mobile number." },
      { status: 404 }
    );

  const ageDays = (Date.now() - new Date(order.created_at).getTime()) / 86_400_000;
  if (ageDays > SITE.replacementDays + 7)
    return Response.json(
      { error: `This order is past the ${SITE.replacementDays}-day replacement window. Please call us at ${SITE.phone}.` },
      { status: 400 }
    );

  if (!REASONS.includes(reason)) return Response.json({ error: "Please choose a reason." }, { status: 400 });
  if (details.length < 10)
    return Response.json({ error: "Please describe the problem in a little more detail." }, { status: 400 });

  const existing = await db()
    .from("replacement_requests")
    .select("id")
    .eq("order_no", orderNo)
    .in("status", ["open", "approved"])
    .limit(1);

  if (existing.data && existing.data.length > 0)
    return Response.json(
      { error: "A replacement request for this order is already being processed." },
      { status: 409 }
    );

  const { error } = await db().from("replacement_requests").insert({
    order_no: orderNo,
    name: order.customer_name,
    phone: order.phone,
    reason,
    details: details.slice(0, 1500),
  });

  if (error) {
    console.error("Replacement insert failed", error);
    return Response.json({ error: "Your request could not be submitted. Please call us." }, { status: 500 });
  }

  void sendReplacementAlert({ orderNo, name: order.customer_name, phone: order.phone, reason, details });

  return Response.json({
    ok: true,
    message: "Your replacement request has been received. Our team will call you within 24 working hours.",
  });
}
