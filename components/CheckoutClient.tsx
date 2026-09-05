"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { money, shippingFor } from "@/lib/pricing";
import { trackBeginCheckout } from "@/lib/track";
import { SITE } from "@/lib/site";
import { useCart } from "./CartProvider";

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Delhi", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu & Kashmir", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal",
];

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export type CheckoutDefaults = {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

export function CheckoutClient({
  onlineEnabled,
  defaults,
}: {
  onlineEnabled: boolean;
  defaults?: CheckoutDefaults;
}) {
  const { items, subtotal, clear, ready } = useCart();
  const router = useRouter();

  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState<{ code: string; discount: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);
  const [method, setMethod] = useState<"cod" | "online">(onlineEnabled ? "online" : "cod");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // Read live so a per-customer coupon limit can be checked against the phone typed above.
  const phoneRef = useRef<HTMLInputElement>(null);

  // Fires once the cart has hydrated, not on every coupon or quantity change.
  const trackedCheckout = useRef(false);
  useEffect(() => {
    if (!ready || trackedCheckout.current || items.length === 0) return;
    trackedCheckout.current = true;
    trackBeginCheckout(items, subtotal);
  }, [ready, items, subtotal]);

  const discount = applied?.discount ?? 0;
  const shipping = shippingFor(subtotal - discount);
  const total = Math.max(0, subtotal - discount + shipping);

  if (!ready) return <div className="container-x py-24 text-center text-ink/50">Loading…</div>;

  if (items.length === 0) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-brand-900">Your cart is empty</h1>
        <Link href="/products" className="mt-6 inline-block rounded-full bg-brand-600 px-8 py-3.5 font-semibold text-white">
          Browse the shop
        </Link>
      </div>
    );
  }

  async function applyCouponCode() {
    if (!coupon.trim()) return;
    setCouponBusy(true);
    setCouponMsg(null);
    const res = await fetch("/api/coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: coupon,
        phone: phoneRef.current?.value ?? "",
        items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
      }),
    });
    const json = await res.json().catch(() => ({ ok: false, message: "Something went wrong." }));
    setCouponBusy(false);
    if (json.ok) {
      setApplied({ code: json.code, discount: json.discount });
      setCouponMsg({ ok: true, text: json.message });
    } else {
      setApplied(null);
      setCouponMsg({ ok: false, text: json.message ?? "The coupon could not be applied." });
    }
  }

  async function placeOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const customer = Object.fromEntries(fd.entries());

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        customer,
        couponCode: applied?.code ?? "",
        paymentMethod: method,
      }),
    });
    const json = await res.json().catch(() => ({ error: "Your order could not be placed." }));

    if (!res.ok) {
      setBusy(false);
      setError(json.error ?? "Your order could not be placed.");
      return;
    }

    if (json.paymentMethod === "cod") {
      clear();
      router.push(`/order/${json.orderNo}`);
      return;
    }

    if (!window.Razorpay) {
      setBusy(false);
      setError("The payment window did not load. Please refresh the page and try again.");
      return;
    }

    const rzp = new window.Razorpay({
      key: json.razorpay.keyId,
      amount: json.razorpay.amount,
      currency: "INR",
      name: SITE.name,
      description: "Ayurvedic Supplement",
      image: SITE.logo,
      order_id: json.razorpay.orderId,
      prefill: { name: customer.name, contact: customer.phone, email: customer.email },
      notes: { orderNo: json.orderNo },
      theme: { color: "#2f6f2b" },
      modal: {
        ondismiss: () => {
          setBusy(false);
          setError("The payment was cancelled. You can try again or switch to Cash on Delivery.");
        },
      },
      handler: async (response: RazorpayResponse) => {
        const verify = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderNo: json.orderNo, ...response }),
        });
        if (verify.ok) {
          clear();
          router.push(`/order/${json.orderNo}`);
        } else {
          setBusy(false);
          setError("We could not verify the payment. Please contact us at " + SITE.phone + ".");
        }
      },
    });
    rzp.open();
  }

  const field = "mt-1 w-full rounded-lg border border-brand-200 px-3 py-2.5 focus:border-brand-500 focus:outline-none";

  return (
    <>
      {onlineEnabled && <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />}

      <div className="container-x py-12">
        <h1 className="font-display text-3xl font-bold text-brand-900">Checkout</h1>

        <form onSubmit={placeOrder} className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-2xl border border-brand-100 p-6">
              <h2 className="font-display text-xl font-bold text-brand-800">Delivery details</h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium">
                  Full name *
                  <input name="name" required defaultValue={defaults?.name} autoComplete="name" className={field} />
                </label>
                <label className="text-sm font-medium">
                  Mobile number *
                  <input
                    ref={phoneRef}
                    name="phone"
                    required
                    inputMode="numeric"
                    pattern="(\+91)?[6-9][0-9]{9}"
                    placeholder="9876543210"
                    defaultValue={defaults?.phone}
                    autoComplete="tel"
                    className={field}
                  />
                </label>
              </div>

              <label className="mt-4 block text-sm font-medium">
                Email (optional)
                <input name="email" type="email" className={field} />
              </label>

              <label className="mt-4 block text-sm font-medium">
                Address (house no, street, area) *
                <textarea name="address" required rows={3} defaultValue={defaults?.address} className={field} />
              </label>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <label className="text-sm font-medium">
                  City *
                  <input name="city" required defaultValue={defaults?.city} className={field} />
                </label>
                <label className="text-sm font-medium">
                  State *
                  <select name="state" required defaultValue={defaults?.state ?? ""} className={field}>
                    <option value="" disabled>Select state</option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-medium">
                  Pincode *
                  <input name="pincode" required inputMode="numeric" pattern="[0-9]{6}" defaultValue={defaults?.pincode} className={field} />
                </label>
              </div>

              <label className="mt-4 block text-sm font-medium">
                Delivery note (optional)
                <input name="notes" placeholder="Landmark or delivery instructions" className={field} />
              </label>
            </section>

            <section className="rounded-2xl border border-brand-100 p-6">
              <h2 className="font-display text-xl font-bold text-brand-800">Payment method</h2>

              <div className="mt-4 space-y-3">
                {onlineEnabled && (
                  <label className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition ${method === "online" ? "border-brand-500 bg-brand-50" : "border-brand-100"}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={method === "online"}
                      onChange={() => setMethod("online")}
                      className="mt-1"
                    />
                    <span>
                      <span className="block font-semibold text-brand-800">Online Payment (UPI / Card / Netbanking)</span>
                      <span className="mt-1 block text-sm text-ink/60">
                        Pay through Razorpay’s secure gateway. Instant confirmation.
                      </span>
                    </span>
                  </label>
                )}

                <label className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition ${method === "cod" ? "border-brand-500 bg-brand-50" : "border-brand-100"}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={method === "cod"}
                    onChange={() => setMethod("cod")}
                    className="mt-1"
                  />
                  <span>
                    <span className="block font-semibold text-brand-800">Cash on Delivery (COD)</span>
                    <span className="mt-1 block text-sm text-ink/60">
                      Pay the delivery partner in cash when the product arrives. No extra charge.
                    </span>
                  </span>
                </label>
              </div>

              {!onlineEnabled && (
                <p className="mt-4 rounded-lg bg-cream p-3 text-xs text-ink/60">
                  Online payment goes live once the Razorpay keys are set in <code>.env.local</code>. Until then,
                  orders can be placed with Cash on Delivery.
                </p>
              )}
            </section>
          </div>

          <aside className="h-fit rounded-2xl border border-brand-100 bg-cream p-6">
            <h2 className="font-display text-xl font-bold text-brand-800">Order Summary</h2>

            <ul className="mt-4 space-y-3">
              {items.map((i) => (
                <li key={i.productId} className="flex gap-3">
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white">
                    <Image src={i.image} alt="" fill sizes="56px" className="object-cover" />
                  </span>
                  <span className="flex-1 text-sm">
                    <span className="block font-medium text-ink/85">{i.name}</span>
                    <span className="text-ink/55">Qty {i.qty}</span>
                  </span>
                  <span className="text-sm font-semibold">{money(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 border-t border-brand-200 pt-4">
              <label className="text-sm font-medium">Coupon code</label>
              <div className="mt-1 flex gap-2">
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  placeholder="ANGAD10"
                  className="flex-1 rounded-lg border border-brand-200 px-3 py-2.5 text-sm uppercase"
                />
                <button
                  type="button"
                  onClick={applyCouponCode}
                  disabled={couponBusy}
                  className="rounded-lg bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
                >
                  {couponBusy ? "…" : "Apply"}
                </button>
              </div>
              {couponMsg && (
                <p className={`mt-2 text-xs ${couponMsg.ok ? "text-brand-700" : "text-red-600"}`}>{couponMsg.text}</p>
              )}
            </div>

            <dl className="mt-5 space-y-2.5 border-t border-brand-200 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink/60">Subtotal</dt>
                <dd>{money(subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-brand-700">
                  <dt>Discount ({applied?.code})</dt>
                  <dd>− {money(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-ink/60">Shipping</dt>
                <dd>{shipping === 0 ? "FREE" : money(shipping)}</dd>
              </div>
              <div className="flex justify-between border-t border-brand-200 pt-3 text-base font-bold">
                <dt>Total</dt>
                <dd className="text-brand-700">{money(total)}</dd>
              </div>
            </dl>

            {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="mt-5 w-full rounded-full bg-brand-600 py-3.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {busy ? "Processing…" : method === "cod" ? `Place COD order · ${money(total)}` : `Pay ${money(total)}`}
            </button>

            <p className="mt-3 text-center text-xs text-ink/55">
              🔒 Secure checkout · {SITE.replacementDays}-day replacement
            </p>
          </aside>
        </form>
      </div>
    </>
  );
}

export default CheckoutClient;
