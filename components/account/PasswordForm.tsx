"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { browserClient } from "@/lib/supabase-browser";

const field =
  "mt-1 w-full rounded-lg border border-brand-200 px-3 py-2.5 focus:border-brand-500 focus:outline-none";

/**
 * Sets a new password.
 *
 * `mode="reset"` runs after a reset link, where Supabase has already put a
 * short-lived session in place — so there is nothing to verify against.
 * `mode="change"` runs inside the account page, where we first re-check the
 * current password so a walked-away-from browser cannot change it.
 */
export function PasswordForm({ mode }: { mode: "reset" | "change" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(mode === "change");

  useEffect(() => {
    if (mode !== "reset") return;
    // The reset link must have produced a session before a new password is allowed.
    browserClient()
      .auth.getSession()
      .then(({ data }) => {
        if (data.session) setReady(true);
        else setError("This reset link is invalid or has expired. Please request a new one.");
      });
  }, [mode]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const password = String(data.get("password") ?? "");
    const confirm = String(data.get("confirm") ?? "");

    if (password.length < 8) return setError("Please choose a password of at least 8 characters.");
    if (password !== confirm) return setError("The two passwords do not match.");

    setBusy(true);
    setError("");

    const supabase = browserClient();

    if (mode === "change") {
      const current = String(data.get("current") ?? "");
      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email;

      if (!email) {
        setBusy(false);
        return setError("You are not signed in.");
      }

      const { error: reauthError } = await supabase.auth.signInWithPassword({ email, password: current });
      if (reauthError) {
        setBusy(false);
        return setError("Your current password is not correct.");
      }
    }

    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);

    if (error) return setError(error.message);

    setDone(true);
    if (mode === "reset") {
      setTimeout(() => {
        router.push("/account");
        router.refresh();
      }, 1200);
    }
  }

  if (done) {
    return (
      <p className="rounded-xl bg-brand-50 p-5 text-sm text-brand-800">
        ✓ Your password has been updated{mode === "reset" ? " — taking you to your account…" : "."}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {mode === "change" && (
        <label className="block text-sm font-medium">
          Current password
          <input name="current" type="password" required autoComplete="current-password" className={field} />
        </label>
      )}

      <label className="block text-sm font-medium">
        New password
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          disabled={!ready}
          className={field}
        />
        <span className="mt-1 block text-xs text-ink/50">At least 8 characters.</span>
      </label>

      <label className="block text-sm font-medium">
        Confirm new password
        <input
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          disabled={!ready}
          className={field}
        />
      </label>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={busy || !ready}
        className="rounded-full bg-brand-600 px-8 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {busy ? "Saving…" : "Update password"}
      </button>
    </form>
  );
}

export default PasswordForm;
