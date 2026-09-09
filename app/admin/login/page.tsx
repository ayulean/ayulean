import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { isAdmin } from "@/lib/auth";
import { SITE } from "@/lib/site";

/**
 * Admin sits behind a login and is only ever used by us, so it stays a blocking
 * server render rather than a prerendered shell — nothing here benefits from
 * being instant, and everything on the page is request-bound anyway.
 */
export const instant = false;

export const metadata: Metadata = { title: "Admin Login", robots: { index: false } };

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-brand-100 bg-white p-8 shadow-lg">
        <div className="flex flex-col items-center">
          <Image
            src={SITE.logo}
            alt={SITE.name}
            width={64}
            height={64}
            className="h-16 w-16 rounded-full object-cover ring-2 ring-brand-200"
          />
          <h1 className="mt-4 font-display text-2xl font-bold text-brand-800">{SITE.name} Admin</h1>
          <p className="mt-1 text-sm text-ink/55">Sign in to your dashboard</p>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-xs text-ink/45">
          The password is set by <code className="rounded bg-brand-50 px-1">ADMIN_PASSWORD</code> in{" "}
          <code className="rounded bg-brand-50 px-1">.env.local</code>.
        </p>
      </div>
    </div>
  );
}
