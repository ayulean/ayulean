"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { money, shippingFor } from "@/lib/pricing";
import { trackBeginCheckout } from "@/lib/track";
import { SITE } from "@/lib/site";
import Icon from "./Icon";
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

  if (!ready) {
    return (
      <div className="container-x py-20">
        <div className="skeleton h-9 w-40 rounded-lg" />
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="skeleton h-96 rounded-card lg:col-span-2" />
          <div className="skeleton h-80 rounded-card" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-x flex flex-col items-center py-20 text-center sm:py-24">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted text-brand-400">
          <Icon name="bag" size={28} />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold tracking-tight text-brand-900 sm:text-3xl">
          Your cart is empty
        </h1>
        <Link href="/products" className="btn btn-primary btn-lg mt-7">
          Browse the shop
          <Icon name="arrow-right" size={17} />
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

  return (
    <>
      {onlineEnabled && <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />}

      <div className="container-x py-10 lg:py-14">
        <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">Checkout</h1>

        <form onSubmit={placeOrder} className="mt-8 grid gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="space-y-5 lg:col-span-2">
            <section className="card card-pad">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-brand-800">
                <Icon name="truck" size={18} className="text-brand-500" />
                Delivery details
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="co-name" className="label">
                    Full name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="co-name"
                    name="name"
                    required
                    defaultValue={defaults?.name}
                    autoComplete="name"
                    className="field"
                  />
                </div>
                <div>
                  <label htmlFor="co-phone" className="label">
                    Mobile number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="co-phone"
                    ref={phoneRef}
                    name="phone"
                    required
                    inputMode="numeric"
                    pattern="(\+91)?[6-9][0-9]{9}"
                    placeholder="9876543210"
                    defaultValue={defaults?.phone}
                    autoComplete="tel"
                    className="field"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="co-email" className="label">
                  Email <span className="font-normal text-ink/40">(optional)</span>
                </label>
                <input id="co-email" name="email" type="email" autoComplete="email" className="field" />
              </div>

              <div className="mt-4">
                <label htmlFor="co-address" className="label">
                  Address — house no, street, area <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="co-address"
                  name="address"
                  required
                  rows={3}
                  defaultValue={defaults?.address}
                  autoComplete="street-address"
                  className="field"
                />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="co-city" className="label">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="co-city"
                    name="city"
                    required
                    defaultValue={defaults?.city}
                    autoComplete="address-level2"
                    className="field"
                  />
                </div>
                <div>
                  <label htmlFor="co-state" className="label">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="co-state"
                    name="state"
                    required
                    defaultValue={defaults?.state ?? ""}
                    autoComplete="address-level1"
                    className="field"
                  >
                    <option value="" disabled>
                      Select state
                    </option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="co-pincode" className="label">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="co-pincode"
                    name="pincode"
                    required
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    defaultValue={defaults?.pincode}
                    autoComplete="postal-code"
                    className="field"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="co-notes" className="label">
                  Delivery note <span className="font-normal text-ink/40">(optional)</span>
                </label>
                <input
                  id="co-notes"
                  name="notes"
                  placeholder="Landmark or delivery instructions"
                  className="field"
                />
              </div>
            </section>

            <section className="card card-pad">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-brand-800">
                <Icon name="card" size={18} className="text-brand-500" />
                Payment method
              </h2>

              <div className="mt-5 space-y-3">
                {onlineEnabled && (
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors duration-200 ${
                      method === "online" ? "border-brand-500 bg-brand-50" : "border-line hover:border-line-strong"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={method === "online"}
                      onChange={() => setMethod("online")}
                      className="mt-1 accent-brand-600"
                    />
                    <span>
                      <span className="block font-semibold text-brand-800">
                        Online payment — UPI, card or netbanking
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-ink/55">
                        Pay through Razorpay’s secure gateway. Instant confirmation.
                      </span>
                    </span>
                  </label>
                )}

                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors duration-200 ${
                    method === "cod" ? "border-brand-500 bg-brand-50" : "border-line hover:border-line-strong"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={method === "cod"}
                    onChange={() => setMethod("cod")}
                    className="mt-1 accent-brand-600"
                  />
                  <span>
                    <span className="block font-semibold text-brand-800">Cash on Delivery</span>
                    <span className="mt-1 block text-sm leading-relaxed text-ink/55">
                      Pay the delivery partner in cash when the product arrives. No extra charge.
                    </span>
                  </span>
                </label>
              </div>

              {!onlineEnabled && (
                <p className="mt-4 rounded-xl bg-surface-muted p-3 text-xs leading-relaxed text-ink/55">
                  Online payment goes live once the Razorpay keys are set in <code>.env.local</code>. Until
                  then, orders can be placed with Cash on Delivery.
                </p>
              )}
            </section>
          </div>

          <aside className="card card-pad h-fit bg-surface-muted lg:sticky lg:top-24">
            <h2 className="font-display text-lg font-bold text-brand-800">Order summary</h2>

            <ul className="mt-4 space-y-3">
              {items.map((i) => (
                <li key={i.productId} className="flex gap-3">
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white">
                    <Image src={i.image} alt="" fill sizes="56px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1 text-sm">
                    <span className="block font-medium text-ink/85">{i.name}</span>
                    <span className="text-ink/50">Qty {i.qty}</span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">{money(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 border-t border-line pt-4">
              <label htmlFor="co-coupon" className="label">
                Coupon code
              </label>
              <div className="flex gap-2">
                <input
                  id="co-coupon"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  placeholder="ANGAD10"
                  className="field flex-1 uppercase"
                />
                <button
                  type="button"
                  onClick={applyCouponCode}
                  disabled={couponBusy}
                  className="btn btn-secondary shrink-0"
                >
                  {couponBusy ? "…" : "Apply"}
                </button>
              </div>
              {couponMsg && (
                <p
                  className={`mt-2 flex items-start gap-1.5 text-xs leading-relaxed ${
                    couponMsg.ok ? "text-brand-700" : "text-red-600"
                  }`}
                >
                  <Icon name={couponMsg.ok ? "check-circle" : "close"} size={13} className="mt-px" />
                  {couponMsg.text}
                </p>
              )}
            </div>

            <dl className="mt-5 space-y-2.5 border-t border-line pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink/55">Subtotal</dt>
                <dd className="tabular-nums">{money(subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-brand-700">
                  <dt>Discount ({applied?.code})</dt>
                  <dd className="tabular-nums">− {money(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-ink/55">Shipping</dt>
                <dd className={`tabular-nums ${shipping === 0 ? "text-brand-600" : ""}`}>
                  {shipping === 0 ? "Free" : money(shipping)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-base font-bold">
                <dt>Total</dt>
                <dd className="tabular-nums text-brand-700">{money(total)}</dd>
              </div>
            </dl>

            {error && (
              <p className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm leading-relaxed text-red-700">
                <Icon name="close" size={15} className="mt-0.5" />
                {error}
              </p>
            )}

            <button type="submit" disabled={busy} className="btn btn-primary btn-lg btn-block mt-5">
              {busy ? "Processing…" : method === "cod" ? `Place COD order · ${money(total)}` : `Pay ${money(total)}`}
            </button>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-ink/50">
              <Icon name="lock" size={13} />
              Secure checkout · {SITE.replacementDays}-day replacement
            </p>
          </aside>
        </form>
      </div>
    </>
  );
}

export default CheckoutClient;
