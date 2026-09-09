/**
 * Tags for the `use cache` entries behind the storefront.
 *
 * Product and review reads are cached so a page can be prerendered and served
 * from the shell instead of waiting on Supabase. Anything that writes to those
 * tables must expire the matching tag — `updateTag` from a Server Action so the
 * admin sees the change on the very next request, `revalidateTag(tag, "max")`
 * from a Route Handler.
 */
export const CACHE_TAGS = {
  /** Product rows, stock and the stats view derived from them. */
  products: "products",
  /** Review rows. Changing one also moves a product's rating, so expire both. */
  reviews: "reviews",
} as const;
