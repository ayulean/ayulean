import { db } from "./supabase";

/**
 * Shared rate limit backed by Postgres, so it holds across server instances.
 * Fails open — if the check itself errors, the request is allowed through
 * rather than blocking a real customer.
 */
export async function allowRequest(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  try {
    const { data, error } = await db().rpc("bump_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });
    if (error) {
      console.error("Rate limit check failed", error);
      return true;
    }
    return data !== false;
  } catch (err) {
    console.error("Rate limit check threw", err);
    return true;
  }
}

/** Best-effort client IP from the usual proxy headers. */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
