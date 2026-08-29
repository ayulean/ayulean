"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReviewForm({ productId }: { productId: number }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setMsg(null);

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        rating,
        name: data.get("name"),
        email: data.get("email"),
        title: data.get("title"),
        body: data.get("body"),
      }),
    });
    const json = await res.json().catch(() => ({ error: "Something went wrong" }));
    setBusy(false);

    if (!res.ok) {
      setMsg({ ok: false, text: json.error ?? "Your review could not be submitted." });
      return;
    }
    form.reset();
    setRating(5);
    setMsg({ ok: true, text: json.message ?? "Thank you! Your review is now live." });
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-brand-100 bg-cream p-6">
      <h3 className="font-display text-xl font-bold text-brand-800">Write a review</h3>
      <p className="mt-1 text-sm text-ink/60">Your feedback helps other customers decide.</p>

      <div className="mt-5">
        <span className="mb-2 block text-sm font-medium">Rating</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} star`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              className="text-3xl leading-none transition"
              style={{ color: n <= (hover || rating) ? "#e0b455" : "#d8d8d2" }}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Name *
          <input name="name" required maxLength={60} className="mt-1 w-full rounded-lg border border-brand-200 px-3 py-2.5" />
        </label>
        <label className="text-sm font-medium">
          Email (optional)
          <input name="email" type="email" className="mt-1 w-full rounded-lg border border-brand-200 px-3 py-2.5" />
        </label>
      </div>

      <label className="mt-4 block text-sm font-medium">
        Title
        <input name="title" maxLength={80} placeholder="Sum up your experience in one line" className="mt-1 w-full rounded-lg border border-brand-200 px-3 py-2.5" />
      </label>

      <label className="mt-4 block text-sm font-medium">
        Review *
        <textarea name="body" required rows={4} maxLength={1500} className="mt-1 w-full rounded-lg border border-brand-200 px-3 py-2.5" />
      </label>

      <button
        type="submit"
        disabled={busy}
        className="mt-5 rounded-full bg-brand-600 px-7 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {busy ? "Submitting…" : "Submit review"}
      </button>

      {msg && (
        <p role="status" className={`mt-4 text-sm ${msg.ok ? "text-brand-700" : "text-red-600"}`}>
          {msg.text}
        </p>
      )}
    </form>
  );
}

export default ReviewForm;
