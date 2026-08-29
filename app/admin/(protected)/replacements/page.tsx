import type { Metadata } from "next";
import { updateReplacementAction } from "@/lib/actions";
import { getReplacementRequests } from "@/lib/queries";
import { ALL_REPLACEMENT_STATUSES, REPLACEMENT_STATUS, isFinished, needsAction } from "@/lib/replacement";
import type { ReplacementRequest } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Replacements", robots: { index: false } };

export default async function AdminReplacementsPage() {
  const requests = await getReplacementRequests();

  // Grouped by what you have to do, not by date — the dispatch queue is the
  // thing that actually needs watching.
  const todo = requests.filter((r) => needsAction(r.status));
  const inTransit = requests.filter((r) => r.status === "shipped");
  const done = requests.filter((r) => isFinished(r.status));

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-brand-900">Replacement requests</h1>
      <p className="mt-1 text-sm text-ink/55">
        {todo.length} need{todo.length === 1 ? "s" : ""} your action · {inTransit.length} on the way ·{" "}
        {done.length} closed
      </p>

      {requests.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-brand-200 p-12 text-center text-ink/50">
          No replacement requests yet.
        </p>
      ) : (
        <>
          <Group title="Needs your action" items={todo} highlight />
          <Group title="Replacement on the way" items={inTransit} />
          <Group title="Closed" items={done} />
        </>
      )}
    </>
  );
}

function Group({
  title,
  items,
  highlight = false,
}: {
  title: string;
  items: ReplacementRequest[];
  highlight?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <section className="mt-8">
      <h2
        className={`font-display text-lg font-bold ${highlight ? "text-gold-600" : "text-brand-800"}`}
      >
        {title} ({items.length})
      </h2>
      <div className="mt-3 space-y-4">
        {items.map((r) => (
          <RequestCard key={r.id} request={r} />
        ))}
      </div>
    </section>
  );
}

function RequestCard({ request: r }: { request: ReplacementRequest }) {
  const info = REPLACEMENT_STATUS[r.status] ?? REPLACEMENT_STATUS.open;
  const needsTracking = r.status === "shipped" && !r.tracking_number;

  return (
    <article className="rounded-2xl border border-brand-100 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono font-semibold text-brand-800">{r.order_no}</p>
          <p className="text-xs text-ink/50">
            {r.name} · {r.phone} · raised {new Date(r.created_at).toLocaleDateString("en-IN")}
          </p>
        </div>
        <div className="text-right">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              info.tone === "bad"
                ? "bg-red-100 text-red-700"
                : info.tone === "pending"
                  ? "bg-gold-400/20 text-gold-600"
                  : "bg-brand-100 text-brand-700"
            }`}
          >
            {info.label}
          </span>
          <p className="mt-1 text-[11px] text-ink/50">Next: {info.adminNext}</p>
        </div>
      </div>

      <p className="mt-3 text-sm font-medium text-ink/85">{r.reason}</p>
      <p className="mt-1 text-sm leading-relaxed text-ink/70">{r.details}</p>

      {needsTracking && (
        <p className="mt-3 rounded-lg bg-gold-400/15 p-3 text-xs text-gold-600">
          Marked as shipped but no tracking number yet — the customer cannot follow it. Add one below.
        </p>
      )}

      {r.tracking_number && (
        <p className="mt-3 text-xs text-ink/60">
          {r.courier || "Courier"}: <strong className="font-mono">{r.tracking_number}</strong>
        </p>
      )}

      <form action={updateReplacementAction} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input type="hidden" name="id" value={r.id} />

        <label className="text-xs font-medium">
          Status
          <select
            name="status"
            defaultValue={r.status}
            className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm"
          >
            {ALL_REPLACEMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {REPLACEMENT_STATUS[s].label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs font-medium">
          Courier
          <input
            name="courier"
            defaultValue={r.courier}
            placeholder="Delhivery, Bluedart…"
            className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm"
          />
        </label>

        <label className="text-xs font-medium">
          Tracking number
          <input
            name="tracking_number"
            defaultValue={r.tracking_number}
            placeholder="AWB number"
            className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm"
          />
        </label>

        <label className="text-xs font-medium">
          Internal note
          <input
            name="admin_note"
            defaultValue={r.admin_note}
            placeholder="Only you see this"
            className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm"
          />
        </label>

        <label className="text-xs font-medium sm:col-span-2 lg:col-span-3">
          Message to customer
          <input
            name="customer_message"
            defaultValue={r.customer_message}
            placeholder="Shown on their order page and included in the email"
            className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm"
          />
        </label>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Save
          </button>
          <a
            href={`https://wa.me/91${r.phone.slice(-10)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-brand-300 px-5 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
          >
            WhatsApp
          </a>
        </div>
      </form>

      <p className="mt-2 text-[11px] text-ink/45">
        Changing the status emails the customer and updates their order page.
      </p>
    </article>
  );
}
