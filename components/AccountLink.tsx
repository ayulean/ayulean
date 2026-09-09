import Link from "next/link";
import { accountsEnabled, currentUser, displayName } from "@/lib/auth-customer";

/**
 * The "Log in" / "<name>" link in the header.
 *
 * Rendered on its own so the session lookup — a round trip to Supabase Auth —
 * sits behind its own Suspense boundary. The rest of the header, and the whole
 * page around it, is prerendered and served without waiting for it.
 */

type Variant = "bar" | "menu";

/** The link with a name already resolved. Also serves as the Suspense fallback. */
export function AccountLinkView({ variant, name }: { variant: Variant; name: string | null }) {
  const href = name ? "/account" : "/account/login";

  if (variant === "menu") {
    return (
      <Link href={href} className="anim-fade-up py-2.5 text-sm font-medium text-brand-700">
        👤 {name ? "My account" : "Log in / Sign up"}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-brand-200 px-3 py-2 text-sm font-medium text-brand-700 transition-colors hover:border-brand-300 hover:bg-brand-50"
    >
      <span aria-hidden="true">👤</span>
      {name ?? "Log in"}
    </Link>
  );
}

export default async function AccountLink({ variant }: { variant: Variant }) {
  const user = accountsEnabled ? await currentUser() : null;
  return <AccountLinkView variant={variant} name={user ? displayName(user) : null} />;
}
