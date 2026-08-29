"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions";

export function LoginForm() {
  const [error, formAction, pending] = useActionState(loginAction, null);

  return (
    <form action={formAction} className="mt-7 space-y-4">
      <label className="block text-sm font-medium">
        Password
        <input
          name="password"
          type="password"
          required
          autoFocus
          className="mt-1 w-full rounded-lg border border-brand-200 px-3 py-2.5 focus:border-brand-500 focus:outline-none"
        />
      </label>

      {error && <p className="rounded-lg bg-red-50 p-2.5 text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {pending ? "Checking…" : "Log in"}
      </button>
    </form>
  );
}

export default LoginForm;
