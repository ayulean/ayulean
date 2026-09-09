import type { Metadata } from "next";
import Link from "next/link";
import AccountsDisabled from "@/components/account/AccountsDisabled";
import ForgotPasswordForm from "@/components/account/ForgotPasswordForm";
import { accountsEnabled } from "@/lib/auth-customer";

/**
 * A personal page: it exists only for the signed-in customer, or for one
 * specific order. There is no shared shell worth prerendering, so it blocks on
 * the server rather than streaming an empty frame first.
 */
export const instant = false;

export const metadata: Metadata = { title: "Forgot password", robots: { index: false } };

export default function ForgotPasswordPage() {
  if (!accountsEnabled) return <AccountsDisabled />;

  return (
    <div className="container-x py-14">
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-3xl font-bold text-brand-900">Forgot your password?</h1>
        <p className="mt-2 text-ink/60">
          Enter your email and we will send you a link to set a new one.
        </p>

        <div className="mt-7">
          <ForgotPasswordForm />
        </div>

        <p className="mt-6 text-sm text-ink/60">
          Remembered it?{" "}
          <Link href="/account/login" className="font-semibold text-brand-700 hover:underline">
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}
