import { REPLACEMENT_STATUS, REPLACEMENT_STEPS } from "@/lib/replacement";
import { SITE } from "@/lib/site";
import type { ReplacementRequest } from "@/lib/types";

const TONE = {
  pending: "border-gold-400/40 bg-gold-400/10",
  good: "border-brand-200 bg-brand-50",
  bad: "border-red-200 bg-red-50",
} as const;

/** Shows the customer exactly where their replacement has reached. */
export function ReplacementStatusCard({ request }: { request: ReplacementRequest }) {
  const info = REPLACEMENT_STATUS[request.status] ?? REPLACEMENT_STATUS.open;
  const rejected = request.status === "rejected";
  const currentStep = REPLACEMENT_STEPS.indexOf(request.status);

  return (
    <section className={`rounded-2xl border p-5 ${TONE[info.tone]}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg font-bold text-brand-800">Replacement request</h3>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
            rejected ? "bg-red-600 text-white" : "bg-brand-700 text-white"
          }`}
        >
          {info.label}
        </span>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-ink/75">{info.detail}</p>

      {request.tracking_number && (
        <p className="mt-3 rounded-xl bg-white/80 p-3 text-sm text-ink/80">
          <strong className="block text-xs uppercase tracking-wide text-ink/50">
            Replacement shipment
          </strong>
          {request.courier || "Courier"} · Tracking number:{" "}
          <strong className="font-mono">{request.tracking_number}</strong>
        </p>
      )}

      {request.customer_message && (
        <p className="mt-3 rounded-xl bg-white/80 p-3 text-sm leading-relaxed text-ink/80">
          <strong className="block text-xs uppercase tracking-wide text-ink/50">Message from our team</strong>
          {request.customer_message}
        </p>
      )}

      {!rejected && (
        <ol className="mt-5 flex items-start">
          {REPLACEMENT_STEPS.map((step, idx) => {
            const done = currentStep >= idx;
            return (
              <li key={step} className="flex flex-1 items-center last:flex-none">
                <div className="flex w-full flex-col items-center text-center">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      done ? "bg-brand-600 text-white" : "bg-white/80 text-ink/40"
                    }`}
                  >
                    {done ? "✓" : idx + 1}
                  </span>
                  <span className="mt-1.5 text-[10px] leading-tight text-ink/60">
                    {REPLACEMENT_STATUS[step].label}
                  </span>
                </div>
                {idx < REPLACEMENT_STEPS.length - 1 && (
                  <span className={`mx-1 mt-[-18px] h-0.5 flex-1 ${done ? "bg-brand-500" : "bg-white/80"}`} />
                )}
              </li>
            );
          })}
        </ol>
      )}

      <dl className="mt-5 space-y-1 text-xs text-ink/60">
        <div>
          <dt className="inline font-medium">Reason: </dt>
          <dd className="inline">{request.reason}</dd>
        </div>
        <div>
          <dt className="inline font-medium">Raised on: </dt>
          <dd className="inline">{new Date(request.created_at).toLocaleDateString("en-IN")}</dd>
        </div>
        {request.shipped_at && (
          <div>
            <dt className="inline font-medium">Replacement dispatched: </dt>
            <dd className="inline">{new Date(request.shipped_at).toLocaleDateString("en-IN")}</dd>
          </div>
        )}
        {request.delivered_at && (
          <div>
            <dt className="inline font-medium">Delivered: </dt>
            <dd className="inline">{new Date(request.delivered_at).toLocaleDateString("en-IN")}</dd>
          </div>
        )}
      </dl>

      <p className="mt-4 text-xs text-ink/55">
        Any question about this replacement? Call or WhatsApp us at {SITE.phone}.
      </p>
    </section>
  );
}

export default ReplacementStatusCard;
