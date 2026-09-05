import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import SetupNotice from "@/components/SetupNotice";
import { logoutAction } from "@/lib/actions";
import { isAdmin } from "@/lib/auth";
import { SITE } from "@/lib/site";
import { supabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!supabaseConfigured) return <SetupNotice />;
  if (!(await isAdmin())) redirect("/admin/login");

  return (
    <div className="flex min-h-screen flex-col bg-brand-50/40 print:block print:bg-white lg:flex-row">
      <aside className="border-b border-brand-100 bg-white print:hidden lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-2.5 p-5">
          <Image
            src={SITE.logo}
            alt={SITE.name}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover ring-1 ring-brand-200 transition-transform duration-300 hover:scale-105"
          />
          <div>
            <p className="font-display text-lg font-bold leading-tight text-brand-800">{SITE.name}</p>
            <p className="text-xs text-ink/50">Admin panel</p>
          </div>
        </div>

        <AdminNav />

        <div className="hidden border-t border-brand-100 p-3 lg:block">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-ink/75 transition-colors duration-200 hover:bg-brand-50 hover:text-brand-700"
          >
            🏠 View website
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors duration-200 hover:bg-red-50"
            >
              🚪 Logout
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 p-5 print:p-0 lg:p-8">
        {children}
        <form action={logoutAction} className="mt-10 print:hidden lg:hidden">
          <button type="submit" className="text-sm font-medium text-red-600">🚪 Logout</button>
        </form>
      </main>
    </div>
  );
}
