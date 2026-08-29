import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AccountsDisabled from "@/components/account/AccountsDisabled";
import AuthForm from "@/components/account/AuthForm";
import { accountsEnabled, currentUser } from "@/lib/auth-customer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

function safeNext(value: unknown) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/account";
}

export default async function LoginPage({ searchParams }: PageProps<"/account/login">) {
  if (!accountsEnabled) return <AccountsDisabled />;

  const sp = await searchParams;
  const next = safeNext(sp.next);

  if (await currentUser()) redirect(next);

  return (
    <div className="container-x py-14">
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-3xl font-bold text-brand-900">Log in</h1>
        <p className="mt-2 text-ink/60">
          {next === "/checkout"
            ? "Log in to place your order and keep track of it."
            : "Welcome back — log in to see your orders."}
        </p>

        {typeof sp.error === "string" && (
          <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{sp.error}</p>
        )}

        <div className="mt-7">
          <AuthForm mode="login" next={next} />
        </div>
      </div>
    </div>
  );
}
