import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AccountsDisabled from "@/components/account/AccountsDisabled";
import AuthForm from "@/components/account/AuthForm";
import { accountsEnabled, currentUser } from "@/lib/auth-customer";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

function safeNext(value: unknown) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/account";
}

export default async function RegisterPage({ searchParams }: PageProps<"/account/register">) {
  if (!accountsEnabled) return <AccountsDisabled />;

  const sp = await searchParams;
  const next = safeNext(sp.next);

  if (await currentUser()) redirect(next);

  return (
    <div className="container-x py-14">
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-3xl font-bold text-brand-900">Create your account</h1>
        <p className="mt-2 text-ink/60">
          Track your orders, reorder in one tap, and raise a {SITE.replacementDays}-day replacement without
          hunting for your order number.
        </p>

        <div className="mt-7">
          <AuthForm mode="register" next={next} />
        </div>

        <p className="mt-6 text-xs leading-relaxed text-ink/50">
          By creating an account you agree to our{" "}
          <Link href="/policies/terms" className="underline">Terms</Link> and{" "}
          <Link href="/policies/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
