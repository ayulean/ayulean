import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/** Supabase writes its session as `sb-<project-ref>-auth-token`, chunked if large. */
const hasSessionCookie = (request: NextRequest) =>
  request.cookies.getAll().some((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"));

/**
 * Keeps the customer's Supabase session fresh.
 *
 * Server Components cannot write cookies, so the refreshed access token is
 * written here instead. Without this a customer would be silently signed out
 * roughly an hour after signing in.
 *
 * A signed-out visitor has no session to refresh, and asking Supabase about one
 * costs a network round trip in front of every single page. So the check runs
 * only once a session cookie is actually present, which leaves the common case
 * — a shopper who has never logged in — untouched.
 */
export async function proxy(request: NextRequest) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return NextResponse.next();
  if (!hasSessionCookie(request)) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      },
    },
  });

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    // Everything except static assets, images and fonts.
    "/((?!_next/static|_next/image|favicon.ico|img/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?|ttf|txt|xml)$).*)",
  ],
};
