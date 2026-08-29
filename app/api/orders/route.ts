import { couponUsesByPhone, orderNumber, reserveOrderStock } from "@/lib/orders";
import { sendOrderAlert, sendOrderConfirmation } from "@/lib/notify";
import { allowRequest, clientIp } from "@/lib/ratelimit";
import { applyCoupon, shippingFor } from "@/lib/pricing";
import { getCouponByCode, getOrderByNo, getProductById } from "@/lib/queries";
import { onlinePaymentEnabled, razorpay, RZP_KEY_ID } from "@/lib/razorpay";
import { db } from "@/lib/supabase";
import type { CartItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // 10 orders per IP per 10 minutes — generous for a real shopper, useless for a bot.
  if (!(await allowRequest(`order:${clientIp(req)}`, 10, 600))) {
    return Response.json(
      { error: "Too many attempts. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  let body: {
    items?: Array<{ productId: number; qty: number }>;
    customer?: Record<string, string>;
    couponCode?: string;
    paymentMethod?: string;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const c = body.customer ?? {};
  const name = String(c.name ?? "").trim();
  const phone = String(c.phone ?? "").replace(/\s/g, "");
  const email = String(c.email ?? "").trim();
  const address = String(c.address ?? "").trim();
  const city = String(c.city ?? "").trim();
  const state = String(c.state ?? "").trim();
  const pincode = String(c.pincode ?? "").trim();
  const notes = String(c.notes ?? "").trim();

  if (name.length < 2) return Response.json({ error: "Please enter your full name." }, { status: 400 });
  if (!/^(\+91)?[6-9]\d{9}$/.test(phone))
    return Response.json({ error: "Please enter a valid 10-digit mobile number." }, { status: 400 });
  if (address.length < 8) return Response.json({ error: "Please enter your complete address." }, { status: 400 });
  if (!city) return Response.json({ error: "Please enter your city." }, { status: 400 });
  if (!state) return Response.json({ error: "Please select your state." }, { status: 400 });
  if (!/^\d{6}$/.test(pincode)) return Response.json({ error: "Please enter a 6-digit pincode." }, { status: 400 });

  // Prices are always recomputed on the server from the database — never trusted from the client.
  const items: CartItem[] = [];
  for (const raw of body.items ?? []) {
    const p = await getProductById(Number(raw.productId));
    if (!p || !p.active)
      return Response.json({ error: "A product in your cart is no longer available." }, { status: 400 });

    const qty = Math.min(Math.max(1, Math.floor(Number(raw.qty) || 1)), 10);
    if (p.stock < qty)
      return Response.json({ error: `We do not have that many units of ${p.name} in stock.` }, { status: 400 });

    items.push({ productId: p.id, slug: p.slug, name: p.name, image: p.image, price: p.price, mrp: p.mrp, qty });
  }
  if (items.length === 0) return Response.json({ error: "Your cart is empty." }, { status: 400 });

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const couponCode = String(body.couponCode ?? "").trim();
  const coupon = couponCode
    ? applyCoupon(
        await getCouponByCode(couponCode),
        subtotal,
        couponCode,
        await couponUsesByPhone(couponCode, phone)
      )
    : null;
  const discount = coupon?.ok ? coupon.discount : 0;
  const shipping = shippingFor(subtotal - discount);
  const total = subtotal - discount + shipping;

  const paymentMethod = body.paymentMethod === "online" ? "online" : "cod";
  if (paymentMethod === "online" && !onlinePaymentEnabled)
    return Response.json(
      { error: "Online payment is not available right now. Please use Cash on Delivery." },
      { status: 400 }
    );

  const orderNo = orderNumber();

  const insert = await db().from("orders").insert({
    order_no: orderNo,
    customer_name: name,
    phone,
    email,
    address,
    city,
    state,
    pincode,
    items,
    subtotal,
    discount,
    coupon_code: coupon?.ok ? coupon.code : "",
    shipping,
    total,
    payment_method: paymentMethod,
    payment_status: "pending",
    status: paymentMethod === "cod" ? "placed" : "pending_payment",
    notes,
  });

  if (insert.error) {
    console.error("Order insert failed", insert.error);
    return Response.json({ error: "Your order could not be placed. Please try again." }, { status: 500 });
  }

  if (paymentMethod === "cod") {
    try {
      await reserveOrderStock(orderNo);
    } catch (err) {
      // The order is already saved — never fail the customer over a stock counter.
      console.error("Stock reservation failed for", orderNo, err);
    }

    const saved = await getOrderByNo(orderNo);
    if (saved) {
      // Fire and forget: a slow mail server must not hold up the thank-you page.
      void Promise.all([sendOrderConfirmation(saved), sendOrderAlert(saved)]);
    }

    return Response.json({ orderNo, paymentMethod, total });
  }

  const rzp = razorpay();
  if (!rzp) return Response.json({ error: "The payment gateway is not configured." }, { status: 500 });

  try {
    const rzpOrder = await rzp.orders.create({
      amount: total * 100, // paise
      currency: "INR",
      receipt: orderNo,
      notes: { orderNo, customer: name },
    });
    await db().from("orders").update({ razorpay_order_id: rzpOrder.id }).eq("order_no", orderNo);

    return Response.json({
      orderNo,
      paymentMethod,
      total,
      razorpay: { orderId: rzpOrder.id, amount: rzpOrder.amount, keyId: RZP_KEY_ID },
    });
  } catch (err) {
    console.error("Razorpay order create failed", err);
    await db()
      .from("orders")
      .update({ status: "cancelled", payment_status: "failed" })
      .eq("order_no", orderNo);
    return Response.json(
      { error: "We could not start the payment. Please try again or choose Cash on Delivery." },
      { status: 502 }
    );
  }
}
