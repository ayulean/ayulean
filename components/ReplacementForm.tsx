"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";

const REASONS = ["Damaged or leaked", "Seal broken / tampered", "Wrong product received", "Expired product", "Other"];

export function ReplacementForm({ defaultOrderNo = "" }: { defaultOrderNo?: string }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setMsg(null);

    const res = await fetch("/api/replacement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderNo: data.get("orderNo"),
        phone: data.get("phone"),
        reason: data.get("reason"),
        details: data.get("details"),
      }),
    });
    const json = await res.json().catch(() => ({ error: "Something went wrong." }));
    setBusy(false);

    if (!res.ok) {
      setMsg({ ok: false, text: json.error ?? "Your request could not be submitted." });
      return;
    }
    form.reset();
    setMsg({ ok: true, text: json.message });
  }

  const field = "mt-1 w-full rounded-lg border border-brand-200 px-3 py-2.5 focus:border-brand-500 focus:outline-none";

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-brand-100 bg-cream p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Order number *
          <input name="orderNo" required defaultValue={defaultOrderNo} placeholder="AYU2026…" className={`${field} uppercase`} />
        </label>
        <label className="text-sm font-medium">
          Mobile number *
          <input name="phone" required inputMode="numeric" placeholder="9876543210" className={field} />
        </label>
      </div>

      <label className="mt-4 block text-sm font-medium">
        What went wrong? *
        <select name="reason" required defaultValue="" className={field}>
          <option value="" disabled>
            Select a reason
          </option>
          {REASONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-4 block text-sm font-medium">
        Tell us more *
        <textarea
          name="details"
          required
          rows={4}
          minLength={10}
          maxLength={1500}
          placeholder="Describe the problem so our team can act quickly."
          className={field}
        />
      </label>

      <button
        type="submit"
        disabled={busy}
        className="mt-5 rounded-full bg-brand-600 px-8 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {busy ? "Submitting…" : "Submit request"}
      </button>

      {msg && (
        <p role="status" className={`mt-4 text-sm ${msg.ok ? "text-brand-700" : "text-red-600"}`}>
          {msg.text}
        </p>
      )}

      <p className="mt-4 text-xs leading-relaxed text-ink/55">
        Prefer to talk? Call or WhatsApp us at {SITE.phone}. Please keep 2–3 photos of the product, packaging and
        invoice ready — our team will ask for them.
      </p>
    </form>
  );
}

export default ReplacementForm;
