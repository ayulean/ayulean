"use client";

import { useState } from "react";
import { browserClient } from "@/lib/supabase-browser";

export function ForgotPasswordForm() {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();

    setBusy(true);
    setError("");

    const { error } = await browserClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/account/reset-password`,
    });

    setBusy(false);

    // Never reveal whether an address is registered — that would leak who has
    // an account here. The confirmation is shown either way.
    if (error && !/rate/i.test(error.message)) {
      setSent(true);
      return;
    }
    if (error) {
      setError("Too many attempts. Please wait a few minutes and try again.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <p className="rounded-xl bg-brand-50 p-5 text-sm leading-relaxed text-brand-800">
        If that email has an account with us, a password reset link is on its way. The link works once and
        expires in an hour. Remember to check your spam folder.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm font-medium">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 w-full rounded-lg border border-brand-200 px-3 py-2.5 focus:border-brand-500 focus:outline-none"
        />
      </label>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-brand-600 py-3.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {busy ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}

export default ForgotPasswordForm;
