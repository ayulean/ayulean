import { money } from "./pricing";
import { REPLACEMENT_STATUS } from "./replacement";
import { SITE } from "./site";
import type { Order, ReplacementStatus } from "./types";

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const FROM = process.env.ORDER_FROM_EMAIL || "AyuLean <onboarding@resend.dev>";
const ADMIN_EMAIL = process.env.ORDER_NOTIFY_EMAIL ?? "";
/** Replies to any order email land here, whatever the technical sender is. */
const REPLY_TO = process.env.ORDER_REPLY_TO || SITE.email;

/** True once a Resend API key is present. Without it, emails are only logged. */
export const emailEnabled = Boolean(RESEND_API_KEY);

async function send(to: string, subject: string, html: string) {
  if (!emailEnabled) {
    console.info(`[email skipped — no RESEND_API_KEY] to=${to} subject=${subject}`);
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to: [to], subject, html, reply_to: REPLY_TO }),
    });

    if (!res.ok) console.error("Email send failed", res.status, await res.text());
  } catch (err) {
    // Never let a mail failure break an order.
    console.error("Email send threw", err);
  }
}

function itemRows(order: Order) {
  return order.items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0">${i.name} &times; ${i.qty}</td><td align="right" style="padding:8px 0">${money(
          i.price * i.qty
        )}</td></tr>`
    )
    .join("");
}

function shell(title: string, body: string) {
  return `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:560px;margin:0 auto;color:#1b2318">
    <h1 style="font-size:22px;color:#275824;margin:0 0 4px">${SITE.name}</h1>
    <p style="margin:0 0 20px;color:#666;font-size:13px">${SITE.tagline}</p>
    <h2 style="font-size:18px;margin:0 0 12px">${title}</h2>
    ${body}
    <hr style="border:none;border-top:1px solid #e0f0dd;margin:24px 0">
    <p style="font-size:12px;color:#777;line-height:1.6">
      ${SITE.address}<br>${SITE.phone} · ${SITE.email}
    </p>
  </div>`;
}

function summaryTable(order: Order) {
  return `<table width="100%" style="font-size:14px;border-collapse:collapse">
      ${itemRows(order)}
      <tr><td style="padding-top:12px;border-top:1px solid #e0f0dd">Subtotal</td><td align="right" style="padding-top:12px;border-top:1px solid #e0f0dd">${money(order.subtotal)}</td></tr>
      ${order.discount > 0 ? `<tr><td style="color:#2f6f2b">Discount ${order.coupon_code}</td><td align="right" style="color:#2f6f2b">− ${money(order.discount)}</td></tr>` : ""}
      <tr><td>Shipping</td><td align="right">${order.shipping === 0 ? "FREE" : money(order.shipping)}</td></tr>
      <tr><td style="font-weight:700;padding-top:8px">Total</td><td align="right" style="font-weight:700;padding-top:8px">${money(order.total)}</td></tr>
    </table>`;
}

/** Order confirmation for the customer. Silently skipped if they left email blank. */
export async function sendOrderConfirmation(order: Order) {
  if (!order.email) return;

  const payLine =
    order.payment_method === "cod"
      ? `Please keep <strong>${money(order.total)}</strong> ready for the delivery partner.`
      : `We have received your payment of <strong>${money(order.total)}</strong>. Thank you!`;

  await send(
    order.email,
    `Order ${order.order_no} confirmed — ${SITE.name}`,
    shell(
      `Thank you, ${order.customer_name}!`,
      `<p style="font-size:14px;line-height:1.6">Your order <strong>${order.order_no}</strong> is confirmed and will be delivered in 2–5 working days.</p>
       <p style="font-size:14px;line-height:1.6">${payLine}</p>
       ${summaryTable(order)}
       <p style="font-size:13px;line-height:1.6;margin-top:20px">
         <strong>Delivery address</strong><br>${order.address}, ${order.city}, ${order.state} — ${order.pincode}
       </p>
       <p style="font-size:13px;color:#666;line-height:1.6">
         Every order is covered by our ${SITE.replacementDays}-day replacement policy.
       </p>`
    )
  );
}

/** Heads-up for the store owner so no order is missed. */
export async function sendOrderAlert(order: Order) {
  if (!ADMIN_EMAIL) {
    console.info(`[admin alert skipped — no ORDER_NOTIFY_EMAIL] order=${order.order_no}`);
    return;
  }

  await send(
    ADMIN_EMAIL,
    `🎉 New ${order.payment_method.toUpperCase()} order ${order.order_no} — ${money(order.total)}`,
    shell(
      `New order: ${order.order_no}`,
      `<p style="font-size:14px;line-height:1.6">
         <strong>${order.customer_name}</strong> · ${order.phone}${order.email ? ` · ${order.email}` : ""}<br>
         ${order.address}, ${order.city}, ${order.state} — ${order.pincode}
         ${order.notes ? `<br><em>Note: ${order.notes}</em>` : ""}
       </p>
       ${summaryTable(order)}
       <p style="font-size:13px;color:#666;margin-top:16px">
         Payment: ${order.payment_method.toUpperCase()} (${order.payment_status})
       </p>`
    )
  );
}

/** Sent when the admin adds a courier tracking number. */
export async function sendShippingUpdate(order: Order) {
  if (!order.email || !order.tracking_number) return;

  await send(
    order.email,
    `Your order ${order.order_no} has shipped — ${SITE.name}`,
    shell(
      "Your order is on its way 🚚",
      `<p style="font-size:14px;line-height:1.6">
         Order <strong>${order.order_no}</strong> has been dispatched${order.courier ? ` via <strong>${order.courier}</strong>` : ""}.
       </p>
       <p style="font-size:14px;line-height:1.6">Tracking number: <strong>${order.tracking_number}</strong></p>
       <p style="font-size:13px;color:#666;line-height:1.6">
         Any question? Call or WhatsApp us at ${SITE.phone}.
       </p>`
    )
  );
}

/** Alerts the owner when a customer files a replacement request. */
export async function sendReplacementAlert(input: {
  orderNo: string;
  name: string;
  phone: string;
  reason: string;
  details: string;
}) {
  if (!ADMIN_EMAIL) return;

  await send(
    ADMIN_EMAIL,
    `🔄 Replacement request for ${input.orderNo}`,
    shell(
      "New replacement request",
      `<p style="font-size:14px;line-height:1.6">
         <strong>${input.name}</strong> · ${input.phone}<br>
         Order: <strong>${input.orderNo}</strong><br>
         Reason: <strong>${input.reason}</strong>
       </p>
       <p style="font-size:14px;line-height:1.6">${input.details || "(no extra details)"}</p>`
    )
  );
}

/** Tells the customer their replacement request has been decided. */
export async function sendReplacementStatusEmail(input: {
  to: string;
  name: string;
  orderNo: string;
  status: ReplacementStatus;
  customerMessage: string;
}) {
  if (!input.to) return;

  const info = REPLACEMENT_STATUS[input.status] ?? REPLACEMENT_STATUS.open;

  await send(
    input.to,
    `Replacement request for ${input.orderNo} — ${info.label}`,
    shell(
      `Replacement ${info.label.toLowerCase()}`,
      `<p style="font-size:14px;line-height:1.6">Hi ${input.name},</p>
       <p style="font-size:14px;line-height:1.6">
         Your replacement request for order <strong>${input.orderNo}</strong> is now marked
         <strong>${info.label}</strong>.
       </p>
       <p style="font-size:14px;line-height:1.6">${info.detail}</p>
       ${
         input.customerMessage
           ? `<p style="font-size:14px;line-height:1.6;background:#fdfaf3;padding:12px;border-radius:8px">${input.customerMessage}</p>`
           : ""
       }`
    )
  );
}
