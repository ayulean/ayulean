"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const accountsEnabledInBrowser = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

let client: SupabaseClient | null = null;

/** Browser-side Supabase client, used only for auth (sign in, sign up, reset). */
export function browserClient(): SupabaseClient {
  if (!accountsEnabledInBrowser) {
    throw new Error("Customer accounts are not configured (NEXT_PUBLIC_SUPABASE_ANON_KEY is missing).");
  }
  client ??= createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}
