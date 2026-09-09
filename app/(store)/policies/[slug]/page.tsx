import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { complianceRows, SITE } from "@/lib/site";
import Icon from "@/components/Icon";

type Policy = { title: string; intro: string; sections: Array<{ h: string; p: string[] }> };

const POLICIES: Record<string, Policy> = {
  replacement: {
    title: `${SITE.replacementDays}-Day Replacement Policy`,
    intro: `Every order on ${SITE.name} comes with an easy ${SITE.replacementDays}-day replacement guarantee. If there is a problem with your product, we send a new one at no extra cost.`,
    sections: [
      {
        h: "When a replacement applies",
        p: [
          "The product arrived damaged, leaked or broken.",
          "The seal was broken or the packaging was tampered with.",
          "The wrong product or the wrong quantity was delivered.",
          "The product is expired, or less than 3 months of shelf life is left.",
        ],
      },
      {
        h: "How to raise a request",
        p: [
          `Call or WhatsApp us at ${SITE.phone}, or email ${SITE.email}, within ${SITE.replacementDays} days of delivery.`,
          "Share your order number along with 2–3 photos of the issue (product, packaging and invoice).",
          "Our team approves the request within 24 working hours and schedules a reverse pickup.",
          "Once the pickup is done, the new product is delivered within 5–7 working days.",
        ],
      },
      {
        h: "Conditions",
        p: [
          "The product must be returned in its original packaging, along with the invoice and any free items.",
          "A partly used or opened product that is not claimed for a damage or quality issue cannot be replaced.",
          `Requests raised after ${SITE.replacementDays} days cannot be accepted.`,
          "One replacement is allowed per order.",
        ],
      },
      {
        h: "Refunds",
        p: [
          "If a replacement is out of stock, prepaid orders are fully refunded to the original payment method within 5–7 working days.",
          "Cash on Delivery orders are refunded by bank transfer or UPI — our team confirms the details with you.",
          "Any shipping charge you paid is also refunded in case of a damaged or incorrect product.",
        ],
      },
    ],
  },
  refund: {
    title: "Cancellation & Refund Policy",
    intro: `You can cancel an order any time before it is shipped, and every refund we owe you is paid back to the same account you paid from. This page is the complete cancellation and refund policy for ${SITE.name}.`,
    sections: [
      {
        h: "Cancelling an order",
        p: [
          "An order can be cancelled by you, free of charge, at any point until it is handed to the courier — open Track Order or your account's Orders page and use Cancel Order.",
          "Once the order has been shipped it can no longer be cancelled online. Call or WhatsApp us at " + SITE.phone + " and we will try to recall the parcel; if the recall succeeds the order is refunded in full.",
          "We may ourselves cancel an order if the address is incomplete, the pincode is not serviceable, the item goes out of stock, or the order is flagged as fraudulent. Prepaid orders cancelled by us are always refunded in full.",
        ],
      },
      {
        h: "Refund timelines",
        p: [
          "Prepaid orders: the refund is initiated within 24-48 working hours of the cancellation or of an approved replacement claim being closed as a refund.",
          "Once initiated, the money reaches your bank, card or UPI account within 5-7 working days. The exact time is set by your bank, not by us.",
          "Cash on Delivery orders: nothing has been charged, so a cancellation before delivery needs no refund. Where a refund is due on a delivered COD order, we pay it by UPI or bank transfer within 5-7 working days of collecting your details.",
        ],
      },
      {
        h: "How the money comes back",
        p: [
          "Refunds on prepaid orders always go back to the original payment method - the same card, UPI ID, wallet or bank account. We cannot redirect a refund to a different account.",
          "The refund reference number is sent to you on WhatsApp and email as soon as the refund is initiated.",
          "We never ask for your card number, CVV, PIN, OTP or bank password to process a refund. Anyone asking for these in our name is not us.",
        ],
      },
      {
        h: "When a refund is not given",
        p: [
          "The product has been opened or partly used and there is no damage or quality issue - a supplement cannot be resold once its seal is broken, so it can only be replaced under the conditions on the Replacement page, not refunded.",
          "The request is raised more than " + String(SITE.replacementDays) + " days after delivery.",
          "The parcel was refused at the door repeatedly, or the delivery failed because of a wrong address or an unreachable phone number.",
          "Products bought as part of a combo cannot be refunded individually - the combo is refunded as a whole.",
        ],
      },
      {
        h: "Raising a refund request",
        p: [
          "Email " + SITE.email + " or call/WhatsApp " + SITE.phone + " with your order number and the reason.",
          "We reply to every request within 24 working hours and tell you clearly whether it is approved, and if not, why.",
        ],
      },
    ],
  },
  shipping: {
    title: "Shipping Policy",
    intro: "We deliver across India. Orders are dispatched within 24–48 working hours of being confirmed.",
    sections: [
      {
        h: "Delivery time",
        p: [
          "Metro cities: 2–4 working days.",
          "Rest of India: 3–7 working days.",
          "Remote pincodes may take 2–3 days longer.",
        ],
      },
      {
        h: "Shipping charges",
        p: [
          `Shipping is completely free on orders above ${SITE.currency}${SITE.freeShippingAbove}.`,
          `Below that, a flat ${SITE.currency}${SITE.shippingFee} shipping charge applies.`,
          "There is no extra fee for choosing Cash on Delivery.",
        ],
      },
      {
        h: "Tracking",
        p: [
          "Tracking details are sent by SMS and WhatsApp as soon as your order is dispatched.",
          "You can also check the status any time on our Track Order page using your order number and mobile number.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    intro: `${SITE.name} takes your privacy seriously. This page explains what information we collect and why.`,
    sections: [
      {
        h: "What we collect",
        p: [
          "Your name, mobile number, email and delivery address — used only to process and deliver your order.",
          "Your order history, and any reviews you choose to submit.",
          "We do not store your payment details — online payments are handled entirely on Razorpay's secure gateway.",
        ],
      },
      {
        h: "How we use it",
        p: [
          "To send order confirmation, dispatch and delivery updates.",
          "To handle customer support and replacement requests.",
          "We never sell your data. Only the information needed to complete your order is shared with our delivery partner and payment gateway.",
        ],
      },
      {
        h: "Your rights",
        p: [
          `Write to ${SITE.email} to view, update or delete your data.`,
          "You can opt out of promotional messages at any time.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    intro: `By using this website you agree to these terms. This website is operated by ${SITE.name} (${SITE.addressShort}).`,
    sections: [
      {
        h: "Product information",
        p: [
          "We make every effort to keep product information, prices and images accurate.",
          "Prices and offers may change without prior notice. The price shown at the time you place your order is the price that applies to it.",
        ],
      },
      {
        h: "Orders",
        p: [
          "An order is treated as confirmed only once we accept and dispatch it.",
          "We may cancel an order in case of an incorrect address, a fraudulent order, or repeatedly refused Cash on Delivery orders.",
          "Coupon codes carry their own conditions — minimum order value, expiry and usage limits — which are applied at checkout.",
        ],
      },
      {
        h: "Health disclaimer",
        p: [
          "This product is an Ayurvedic dietary supplement, not a medicine. It makes no claim to diagnose, treat, cure or prevent any disease.",
          "Results vary from person to person. The best results come alongside a balanced diet and an active lifestyle.",
          "If you are pregnant, breastfeeding, have a medical condition or are on ongoing medication, consult a qualified doctor before use.",
        ],
      },
      {
        h: "Governing law",
        p: [
          "These terms are governed by Indian law. The courts of Karnal, Haryana have exclusive jurisdiction over any dispute.",
        ],
      },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(POLICIES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/policies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const policy = POLICIES[slug];
  return policy ? { title: policy.title, description: policy.intro } : { title: "Not found" };
}

export default async function PolicyPage({ params }: PageProps<"/policies/[slug]">) {
  const { slug } = await params;
  const policy = POLICIES[slug];
  if (!policy) notFound();

  const rows = complianceRows();

  return (
    <div className="container-x py-14">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-4xl font-bold text-brand-900">{policy.title}</h1>
        <p className="mt-4 leading-relaxed text-ink/70">{policy.intro}</p>

        {policy.sections.map((s) => (
          <section key={s.h} className="mt-10">
            <h2 className="font-display text-xl font-bold text-brand-800">{s.h}</h2>
            <ul className="mt-3 space-y-2.5">
              {s.p.map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink/70">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" aria-hidden="true" />
                  {line}
                </li>
              ))}
            </ul>
          </section>
        ))}

        <div className="mt-12 rounded-card border border-line bg-surface-muted p-6 text-sm leading-relaxed text-ink/70">
          <p className="font-semibold text-brand-800">Have a question?</p>
          <p className="mt-2">
            {SITE.address}
            <br />
            <a
              href={`tel:${SITE.phoneRaw}`}
              className="inline-flex items-center gap-1.5 text-brand-700 hover:underline"
            >
              <Icon name="phone" size={14} />
              {SITE.phone}
            </a>
            {" · "}
            <a
              href={`mailto:${SITE.email}`}
              className="inline-flex items-center gap-1.5 break-all text-brand-700 hover:underline"
            >
              <Icon name="mail" size={14} />
              {SITE.email}
            </a>
          </p>

          <dl className="mt-5 grid gap-x-6 gap-y-2 border-t border-line pt-5 text-xs sm:grid-cols-[max-content_1fr]">
            {rows.map((r) => (
              <div key={r.label} className="contents">
                <dt className="font-semibold text-brand-800">{r.label}</dt>
                <dd className="text-ink/65">{r.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
