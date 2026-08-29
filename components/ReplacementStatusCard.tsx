import { REPLACEMENT_STATUS, REPLACEMENT_STEPS } from "@/lib/replacement";
import type { ReplacementRequest } from "@/lib/types";

const TONE = {
  pending: "border-gold-400/40 bg-gold-400/10 text-gold-600",
  good: "border-brand-200 bg-brand-50 text-brand-700",
  bad: "border-red-200 bg-red-50 text-red-700",
} as const;

/** Shows the customer where their replacement request has reached. */
export function ReplacementStatusCard({ request }: { request: ReplacementRequest }) {
  const info = REPLACEMENT_STATUS[request.status] ?? REPLACEMENT_STATUS.open;
  const rejected = request.status === "rejected";
  const currentStep = REPLACEMENT_STEPS.indexOf(request.status);

  return (
    <section className={`rounded-2xl border p-5 ${TONE[info.tone]}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg font-bold">Replacement request</h3>
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-wide">
          {info.label}
        </span>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-ink/75">{info.detail}</p>

      {request.customer_message && (
        <p className="mt-3 rounded-xl bg-white/80 p-3 text-sm leading-relaxed text-ink/80">
          <strong className="block text-xs uppercase tracking-wide text-ink/50">Message from our team</strong>
          {request.customer_message}
        </p>
      )}

      {!rejected && (
        <ol className="mt-5 flex items-center">
          {REPLACEMENT_STEPS.map((step, idx) => {
            const done = currentStep >= idx;
            return (
              <li key={step} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      done ? "bg-brand-600 text-white" : "bg-white/70 text-ink/40"
                    }`}
                  >
                    {done ? "✓" : idx + 1}
                  </span>
                  <span className="mt-1.5 text-[11px] text-ink/60">{REPLACEMENT_STATUS[step].label}</span>
                </div>
                {idx < REPLACEMENT_STEPS.length - 1 && (
                  <span className={`mx-1 h-0.5 flex-1 ${done ? "bg-brand-500" : "bg-white/70"}`} />
                )}
              </li>
            );
          })}
        </ol>
      )}

      <dl className="mt-4 space-y-1 text-xs text-ink/60">
        <div>
          <dt className="inline font-medium">Reason: </dt>
          <dd className="inline">{request.reason}</dd>
        </div>
        <div>
          <dt className="inline font-medium">Raised on: </dt>
          <dd className="inline">{new Date(request.created_at).toLocaleDateString("en-IN")}</dd>
        </div>
      </dl>
    </section>
  );
}

export default ReplacementStatusCard;
