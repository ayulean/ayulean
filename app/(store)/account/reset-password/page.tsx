import type { Metadata } from "next";
import AccountsDisabled from "@/components/account/AccountsDisabled";
import PasswordForm from "@/components/account/PasswordForm";
import { accountsEnabled } from "@/lib/auth-customer";

/**
 * A personal page: it exists only for the signed-in customer, or for one
 * specific order. There is no shared shell worth prerendering, so it blocks on
 * the server rather than streaming an empty frame first.
 */
export const instant = false;

export const metadata: Metadata = { title: "Set a new password", robots: { index: false } };

export default function ResetPasswordPage() {
  if (!accountsEnabled) return <AccountsDisabled />;

  return (
    <div className="container-x py-14">
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-3xl font-bold text-brand-900">Set a new password</h1>
        <p className="mt-2 text-ink/60">Choose a password you have not used here before.</p>

        <div className="mt-7">
          <PasswordForm mode="reset" />
        </div>
      </div>
    </div>
  );
}
