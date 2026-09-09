import { couponUsesByPhone } from "@/lib/orders";
import { applyCoupon } from "@/lib/pricing";
import { getCouponByCode, getProductById } from "@/lib/queries";

export async function POST(req: Request) {
  let body: { code?: string; phone?: string; items?: Array<{ productId: number; qty: number }> };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, discount: 0, message: "Invalid request." }, { status: 400 });
  }

  const code = String(body.code ?? "").trim();
  if (!code)
    return Response.json({ ok: false, discount: 0, message: "Please enter a coupon code." }, { status: 400 });

  let subtotal = 0;
  for (const item of body.items ?? []) {
    const p = await getProductById(Number(item.productId));
    if (p) subtotal += p.price * Math.max(1, Number(item.qty) || 1);
  }

  const phone = String(body.phone ?? "").replace(/\D/g, "");
  const customerUses = phone.length >= 10 ? await couponUsesByPhone(code, phone) : 0;

  const result = applyCoupon(await getCouponByCode(code), subtotal, code, customerUses);
  return Response.json(result, { status: result.ok ? 200 : 400 });
}
