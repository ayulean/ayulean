import type { Metadata } from "next";
import Link from "next/link";
import { updateReplacementAction } from "@/lib/actions";
import { getReplacementRequests } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Replacements", robots: { index: false } };

const STATUSES = ["open", "approved", "rejected", "completed"];

export default async function AdminReplacementsPage() {
  const requests = await getReplacementRequests();
  const open = requests.filter((r) => r.status === "open");

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-brand-900">Replacement requests</h1>
      <p className="mt-1 text-sm text-ink/55">
        {open.length} open {open.length === 1 ? "request" : "requests"} waiting for you.
      </p>

      {requests.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-brand-200 p-12 text-center text-ink/50">
          No replacement requests yet.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {requests.map((r) => (
            <article key={r.id} className="rounded-2xl border border-brand-100 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono font-semibold text-brand-800">{r.order_no}</p>
                  <p className="text-xs text-ink/50">
                    {r.name} · {r.phone} · {new Date(r.created_at).toLocaleString("en-IN")}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    r.status === "open"
                      ? "bg-gold-400/20 text-gold-600"
                      : r.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-brand-100 text-brand-700"
                  }`}
                >
                  {r.status}
                </span>
              </div>

              <p className="mt-3 text-sm font-medium text-ink/85">{r.reason}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink/70">{r.details}</p>

              <form action={updateReplacementAction} className="mt-4 flex flex-wrap items-end gap-3">
                <input type="hidden" name="id" value={r.id} />
                <label className="text-xs font-medium">
                  Status
                  <select
                    name="status"
                    defaultValue={r.status}
                    className="mt-1 block rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="min-w-48 flex-1 text-xs font-medium">
                  Internal note
                  <input
                    name="admin_note"
                    defaultValue={r.admin_note}
                    className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm"
                  />
                </label>
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
                <Link
                  href="/admin/orders"
                  className="text-sm text-brand-600 underline-offset-2 hover:underline"
                >
                  Open orders
                </Link>
              </form>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
