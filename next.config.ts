import type { NextConfig } from "next";

/** Supabase Storage host, derived from SUPABASE_URL so it follows the project. */
const supabaseHost = (() => {
  try {
    return new URL(process.env.SUPABASE_URL ?? "").hostname;
  } catch {
    return "";
  }
})();

const nextConfig: NextConfig = {
  // Storefront pages ship a prerendered shell and stream the request-bound
  // parts (the signed-in name, search results) in behind Suspense. Product and
  // review reads are cached with `use cache` and invalidated by tag.
  cacheComponents: true,
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
};

export default nextConfig;
