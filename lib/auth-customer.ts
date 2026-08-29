import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient, User } from "@supabase/supabase-js";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/** Customer accounts stay switched off until the public anon key is configured. */
export const accountsEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/**
 * Supabase client bound to the visitor's session cookies.
 *
 * This uses the *anon* key, so every query it makes is subject to row level
 * security — a customer can only ever reach their own profile and orders.
 */
export async function customerClient(): Promise<SupabaseClient> {
  const jar = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) jar.set(name, value, options);
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // The middleware refreshes the session instead, so this is safe to ignore.
        }
      },
    },
  });
}

/** The signed-in customer, or null. Always verified against Supabase. */
export async function currentUser(): Promise<User | null> {
  if (!accountsEnabled) return null;

  const supabase = await customerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user ?? null;
}

export type Profile = {
  id: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

export async function currentProfile(): Promise<Profile | null> {
  const user = await currentUser();
  if (!user) return null;

  const supabase = await customerClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, phone, address, city, state, pincode")
    .eq("id", user.id)
    .maybeSingle();

  return (data as Profile | null) ?? { id: user.id, full_name: "", phone: "", address: "", city: "", state: "", pincode: "" };
}

/**
 * The customer's full name.
 *
 * The profile is the source of truth, because that is the form the customer
 * actually edits. Sign-up metadata (or the name Google gave us) is the
 * fallback, and the email prefix is the last resort.
 */
export function fullName(user: User, profile?: Profile | null): string {
  const fromProfile = (profile?.full_name ?? "").trim();
  if (fromProfile) return fromProfile;

  const meta = user.user_metadata ?? {};
  const fromMeta = String(meta.full_name || meta.name || "").trim();
  if (fromMeta) return fromMeta;

  return user.email?.split("@")[0] ?? "there";
}

/** Just the first name — used where space is tight, like the header. */
export function displayName(user: User, profile?: Profile | null): string {
  return fullName(user, profile).split(" ")[0];
}
