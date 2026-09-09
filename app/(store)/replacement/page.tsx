import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ReplacementForm from "@/components/ReplacementForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Request a Replacement",
  description: `Raise a ${SITE.replacementDays}-day replacement request for your ${SITE.name} order.`,
};

/**
 * Only the prefilled order number comes from the query string, so the form is
 * the one piece that waits for the request. Everything around it is prerendered.
 */
export default function ReplacementPage({ searchParams }: PageProps<"/replacement">) {
  return (
    <div className="container-x py-14">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-brand-900">Request a replacement</h1>
        <p className="mt-3 leading-relaxed text-ink/65">
          Something wrong with your order? Raise a request within {SITE.replacementDays} days of delivery and we will
          send a new one at no extra cost.
        </p>

        <div className="mt-8">
          <Suspense fallback={<ReplacementForm defaultOrderNo="" />}>
            <PrefilledForm searchParams={searchParams} />
          </Suspense>
        </div>

        <div className="mt-8 rounded-2xl border border-brand-100 p-6">
          <h2 className="font-display text-lg font-bold text-brand-800">What happens next</h2>
          <ol className="mt-3 space-y-2.5 text-sm leading-relaxed text-ink/70">
            {[
              "Our team reviews your request within 24 working hours and calls you.",
              "We arrange a free reverse pickup — you do not have to ship anything yourself.",
              "The replacement is delivered within 5–7 working days of pickup.",
            ].map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-ink/60">
            Read the full{" "}
            <Link href="/policies/replacement" className="text-brand-700 underline-offset-2 hover:underline">
              {SITE.replacementDays}-day replacement policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

async function PrefilledForm({ searchParams }: Pick<PageProps<"/replacement">, "searchParams">) {
  const sp = await searchParams;
  return <ReplacementForm defaultOrderNo={typeof sp.orderNo === "string" ? sp.orderNo : ""} />;
}
