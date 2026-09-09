import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/** True once both Supabase keys are present in the environment. */
export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

let client: SupabaseClient | null = null;

/**
 * Server-side Supabase client.
 *
 * It uses the service role key, so it bypasses row level security — which is
 * exactly why it must never be imported into a Client Component. Every table
 * has RLS enabled with no policies, so this is the only way into the data.
 */
export function db(): SupabaseClient {
  if (!supabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local (see README section 2)."
    );
  }

  // Freshness is decided one layer up: reads that may be served from cache are
  // wrapped in `use cache` and expired by tag (see lib/cache-tags.ts), and
  // everything else is uncached and therefore always hits Supabase.
  client ??= createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return client;
}

/** Unwraps a Supabase response, turning an error into a thrown exception. */
export function unwrap<T>(res: { data: T | null; error: { message: string } | null }, context: string): T {
  if (res.error) throw new Error(`${context}: ${res.error.message}`);
  return (res.data ?? []) as T;
}
