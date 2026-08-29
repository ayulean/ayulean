import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE } from "@/lib/site";

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

        <div className="mt-12 rounded-2xl border border-brand-100 bg-cream p-6 text-sm leading-relaxed text-ink/70">
          <p className="font-semibold text-brand-800">Have a question?</p>
          <p className="mt-2">
            {SITE.address}
            <br />
            📞 <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="text-brand-700 hover:underline">{SITE.phone}</a> ·{" "}
            ✉️ <a href={`mailto:${SITE.email}`} className="text-brand-700 hover:underline">{SITE.email}</a>
          </p>
        </div>
      </div>
    </div>
  );
}
