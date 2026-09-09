import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AccountsDisabled from "@/components/account/AccountsDisabled";
import PasswordForm from "@/components/account/PasswordForm";
import { saveProfileAction, signOutAction } from "@/lib/account-actions";
import { accountsEnabled, currentProfile, currentUser, fullName } from "@/lib/auth-customer";
import Icon from "@/components/Icon";

/**
 * A personal page: it exists only for the signed-in customer, or for one
 * specific order. There is no shared shell worth prerendering, so it blocks on
 * the server rather than streaming an empty frame first.
 */
export const instant = false;

export const metadata: Metadata = { title: "My account", robots: { index: false } };

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Delhi", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu & Kashmir", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal",
];

const field = "field mt-1";

export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  if (!accountsEnabled) return <AccountsDisabled />;

  const user = await currentUser();
  if (!user) redirect("/account/login");

  const sp = await searchParams;
  const profile = await currentProfile();
  const name = fullName(user, profile);
  const hasName = Boolean(profile?.full_name?.trim());

  // Google accounts have no password of their own to change.
  const hasPassword = user.app_metadata?.providers?.includes("email") ?? user.app_metadata?.provider === "email";

  return (
    <div className="container-x py-14">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-brand-900">Hi {name}</h1>
            <p className="mt-1 text-sm text-ink/55">{user.email}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/account/orders"
              className="btn btn-primary btn-sm"
            >
              My orders
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="btn btn-secondary btn-sm"
              >
                Log out
              </button>
            </form>
          </div>
        </div>

        {sp.saved && (
          <p className="mt-6 flex items-center gap-2 rounded-xl bg-brand-50 p-3 text-sm text-brand-800">
            <Icon name="check-circle" size={16} />
            Your details have been saved.
          </p>
        )}

        <section className="mt-8 rounded-card border border-line p-6">
          <h2 className="font-display text-xl font-bold text-brand-800">Delivery details</h2>
          <p className="mt-1 text-sm text-ink/55">Saved here so checkout fills itself in next time.</p>

          {!hasName && (
            <p className="mt-4 rounded-lg bg-surface-muted p-3 text-sm text-ink/65">
              Add your full name below — it goes on your invoices and delivery labels.
            </p>
          )}

          <form action={saveProfileAction} className="mt-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Full name
                <input
                  name="full_name"
                  defaultValue={profile?.full_name || fullName(user)}
                  autoComplete="name"
                  className={field}
                />
              </label>
              <label className="text-sm font-medium">
                Mobile number
                <input name="phone" inputMode="numeric" defaultValue={profile?.phone} className={field} />
              </label>
            </div>

            <label className="mt-4 block text-sm font-medium">
              Address
              <textarea name="address" rows={3} defaultValue={profile?.address} className={field} />
            </label>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <label className="text-sm font-medium">
                City
                <input name="city" defaultValue={profile?.city} className={field} />
              </label>
              <label className="text-sm font-medium">
                State
                <select name="state" defaultValue={profile?.state ?? ""} className={field}>
                  <option value="">Select state</option>
                  {STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                Pincode
                <input name="pincode" inputMode="numeric" defaultValue={profile?.pincode} className={field} />
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary mt-5"
            >
              Save details
            </button>
          </form>
        </section>

        <section className="mt-8 rounded-card border border-line p-6">
          <h2 className="font-display text-xl font-bold text-brand-800">Password</h2>

          {hasPassword ? (
            <div className="mt-5 max-w-md">
              <PasswordForm mode="change" />
            </div>
          ) : (
            <p className="mt-3 rounded-lg bg-surface-muted p-4 text-sm leading-relaxed text-ink/65">
              You signed in with Google, so there is no password on this account. To add one, log out and use{" "}
              <Link href="/account/forgot-password" className="font-semibold text-brand-700 hover:underline">
                Forgot password
              </Link>{" "}
              with the same email address.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
