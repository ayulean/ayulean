"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Icon from "./Icon";

const REASONS = [
  "Ordered by mistake",
  "Found it cheaper elsewhere",
  "Delivery is taking too long",
  "Changed my mind",
  "Other",
];

export function CancelOrderButton({
  orderNo,
  phone,
  className = "",
}: {
  orderNo: string;
  /** Passed on the guest tracking page, where there is no session to prove ownership. */
  phone?: string;
  className?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  async function cancel(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const reason = String(data.get("reason") ?? "");
    const note = String(data.get("note") ?? "").trim();

    setBusy(true);
    setError("");

    const res = await fetch("/api/orders/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNo, phone, reason: note ? `${reason} — ${note}` : reason }),
    });
    const json = await res.json().catch(() => ({ error: "Something went wrong." }));
    setBusy(false);

    if (!res.ok) {
      setError(json.error ?? "This order could not be cancelled.");
      return;
    }

    setDone(json.message);
    setOpen(false);
    router.refresh();
  }

  if (done) {
    return (
      <p className="flex items-start gap-2 rounded-xl bg-brand-50 p-4 text-sm leading-relaxed text-brand-800">
        <Icon name="check-circle" size={16} className="mt-0.5" />
        {done}
      </p>
    );
  }

  if (!open) {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={className || "text-sm text-red-600 hover:underline"}
        >
          Cancel order
        </button>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </>
    );
  }

  return (
    <form onSubmit={cancel} className="w-full rounded-xl border border-red-200 bg-red-50/50 p-4">
      <p className="text-sm font-semibold text-ink/85">Cancel order {orderNo}?</p>
      <p className="mt-1 text-xs text-ink/60">
        This cannot be undone. Once an order has shipped it can no longer be cancelled.
      </p>

      <label className="mt-3 block text-xs font-medium">
        Reason
        <select
          name="reason"
          defaultValue={REASONS[0]}
          className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm"
        >
          {REASONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </label>

      <label className="mt-3 block text-xs font-medium">
        Anything else? (optional)
        <input
          name="note"
          maxLength={200}
          className="mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm"
        />
      </label>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          {busy ? "Cancelling…" : "Yes, cancel it"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full border border-brand-300 px-5 py-2 text-sm font-semibold text-brand-700 hover:bg-white"
        >
          Keep my order
        </button>
      </div>
    </form>
  );
}

export default CancelOrderButton;
