"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { browserClient } from "@/lib/supabase-browser";
import GoogleButton from "./GoogleButton";

const field =
  "mt-1 w-full rounded-lg border border-brand-200 px-3 py-2.5 focus:border-brand-500 focus:outline-none";

export function AuthForm({ mode, next = "/account" }: { mode: "login" | "register"; next?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");

    setBusy(true);
    setError("");
    setNotice("");

    const supabase = browserClient();

    if (mode === "register") {
      const fullName = String(data.get("full_name") ?? "").trim();
      const phone = String(data.get("phone") ?? "").replace(/\s/g, "");

      if (password.length < 8) {
        setBusy(false);
        setError("Please choose a password of at least 8 characters.");
        return;
      }

      const { data: result, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, phone },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });

      setBusy(false);

      if (error) {
        setError(error.message);
        return;
      }

      // With email confirmation switched on, there is no session yet.
      if (!result.session) {
        setNotice(`We have sent a confirmation link to ${email}. Open it to finish creating your account.`);
        return;
      }

      router.push(next);
      router.refresh();
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "That email and password do not match. Please try again."
          : error.message
      );
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <div>
      <GoogleButton next={next} />

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-ink/40">
        <span className="h-px flex-1 bg-brand-100" />
        or
        <span className="h-px flex-1 bg-brand-100" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {mode === "register" && (
          <>
            <label className="block text-sm font-medium">
              Full name *
              <input name="full_name" required autoComplete="name" className={field} />
            </label>
            <label className="block text-sm font-medium">
              Mobile number
              <input name="phone" inputMode="numeric" autoComplete="tel" placeholder="9876543210" className={field} />
            </label>
          </>
        )}

        <label className="block text-sm font-medium">
          Email *
          <input name="email" type="email" required autoComplete="email" className={field} />
        </label>

        <label className="block text-sm font-medium">
          Password *
          <input
            name="password"
            type="password"
            required
            minLength={mode === "register" ? 8 : undefined}
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            className={field}
          />
          {mode === "register" && (
            <span className="mt-1 block text-xs text-ink/50">At least 8 characters.</span>
          )}
        </label>

        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {notice && <p className="rounded-lg bg-brand-50 p-3 text-sm text-brand-800">{notice}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-brand-600 py-3.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {busy ? "Please wait…" : mode === "register" ? "Create account" : "Log in"}
        </button>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-sm">
        {mode === "login" ? (
          <>
            <Link href="/account/forgot-password" className="text-brand-700 hover:underline">
              Forgot password?
            </Link>
            <span className="text-ink/60">
              New here?{" "}
              <Link
                href={`/account/register${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`}
                className="font-semibold text-brand-700 hover:underline"
              >
                Create an account
              </Link>
            </span>
          </>
        ) : (
          <span className="text-ink/60">
            Already have an account?{" "}
            <Link
              href={`/account/login${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`}
              className="font-semibold text-brand-700 hover:underline"
            >
              Log in
            </Link>
          </span>
        )}
      </div>
    </div>
  );
}

export default AuthForm;
