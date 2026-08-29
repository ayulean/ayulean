import { NextResponse } from "next/server";
import { accountsEnabled, customerClient } from "@/lib/auth-customer";

export const dynamic = "force-dynamic";

/**
 * Where Supabase sends the customer back to after Google sign-in, email
 * confirmation or a password reset link. Swaps the one-time code for a session
 * cookie, then forwards them on.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/account";
  const errorDescription = url.searchParams.get("error_description");

  // Only allow same-site redirects, so this cannot be used as an open redirect.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/account";

  if (errorDescription) {
    return NextResponse.redirect(
      new URL(`/account/login?error=${encodeURIComponent(errorDescription)}`, url.origin)
    );
  }

  if (!accountsEnabled || !code) {
    return NextResponse.redirect(new URL("/account/login", url.origin));
  }

  const supabase = await customerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/account/login?error=${encodeURIComponent("That link has expired. Please try again.")}`, url.origin)
    );
  }

  return NextResponse.redirect(new URL(safeNext, url.origin));
}
