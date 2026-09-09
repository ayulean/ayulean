/**
 * Tags for the `use cache` entries behind the storefront.
 *
 * Product and review reads are cached so a page can be prerendered and served
 * from the shell instead of waiting on Supabase. Anything that writes to those
 * tables must expire the matching tag — `updateTag` from a Server Action so the
 * admin sees the change on the very next request, `revalidateTag(tag, "max")`
 * from a Route Handler.
 *
 * Because every write path is tagged, these entries are held for days rather
 * than hours: the long life keeps a cold serverless instance from paying a
 * fresh round trip to Supabase, and a tag expiry is what actually refreshes
 * them, not the clock.
 */
export const CACHE_TAGS = {
  /** Product rows, stock and the stats view derived from them. */
  products: "products",
  /** Review rows. Changing one also moves a product's rating, so expire both. */
  reviews: "reviews",
} as const;
