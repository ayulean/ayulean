import Icon from "../Icon";

export function AccountsDisabled() {
  return (
    <div className="container-x py-20">
      <div className="mx-auto max-w-lg rounded-card border border-line bg-surface-muted p-8 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand-500">
          <Icon name="lock" size={22} />
        </span>
        <h1 className="mt-4 font-display text-2xl font-bold text-brand-800">Accounts are not set up yet</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/65">
          Customer sign-in needs the public Supabase key. Add{" "}
          <code className="rounded bg-white px-1">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="rounded bg-white px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (Supabase → Project
          Settings → API) and restart the server.
        </p>
        <p className="mt-3 text-sm text-ink/65">
          Everything else works meanwhile — customers can still order as guests.
        </p>
      </div>
    </div>
  );
}

export default AccountsDisabled;
