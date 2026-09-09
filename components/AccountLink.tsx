import Link from "next/link";
import { accountsEnabled, currentUser, displayName } from "@/lib/auth-customer";
import Icon from "./Icon";

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
      <Link
        href={href}
        className="anim-fade-up flex items-center gap-2.5 rounded-xl px-3 py-3 text-[0.9375rem] font-medium text-brand-700 hover:bg-brand-50"
      >
        <Icon name="user" size={17} />
        {name ? "My account" : "Log in / Sign up"}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      aria-label={name ? `Account: ${name}` : "Log in"}
      className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50"
    >
      <Icon name="user" size={18} />
      <span className="hidden max-w-24 truncate sm:inline">{name ?? "Log in"}</span>
    </Link>
  );
}

export default async function AccountLink({ variant }: { variant: Variant }) {
  const user = accountsEnabled ? await currentUser() : null;
  return <AccountLinkView variant={variant} name={user ? displayName(user) : null} />;
}
