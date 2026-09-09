import { cacheLife, cacheTag } from "next/cache";
import { bundleAvailability, bundleSeparateValue, parseBundleItems } from "./bundle";
import { CACHE_TAGS } from "./cache-tags";
import { db, unwrap } from "./supabase";
import type { Coupon, Order, Product, ProductRow, ReplacementRequest, ResolvedComponent, Review } from "./types";

type StatsRow = { product_id: number; review_count: number; avg_rating: number | string };

/** Attaches rating stats, discount and combo details to product rows. */
async function withStats(rows: ProductRow[]): Promise<Product[]> {
  if (rows.length === 0) return [];

  // A combo needs its components' live price and stock. Neither this nor the
  // rating stats depend on the other, so both round trips go out together.
  const bundleItemsByRow = new Map(rows.map((r) => [r.id, parseBundleItems(r.bundle_items)]));
  const componentIds = [...new Set([...bundleItemsByRow.values()].flat().map((c) => c.productId))];

  type Component = Pick<ProductRow, "id" | "name" | "slug" | "image" | "price" | "stock">;

  const [stats, comps] = await Promise.all([
    db()
      .from("product_stats")
      .select("product_id, review_count, avg_rating")
      .in("product_id", rows.map((r) => r.id))
      .then((res) => unwrap<StatsRow[]>(res, "Failed to load product stats")),
    componentIds.length === 0
      ? Promise.resolve([] as Component[])
      : db()
          .from("products")
          .select("id, name, slug, image, price, stock")
          .in("id", componentIds)
          .then((res) => unwrap<Component[]>(res, "Failed to load combo components")),
  ]);

  const statsById = new Map(stats.map((s) => [s.product_id, s]));
  const componentsById = new Map(comps.map((c) => [c.id, c]));

  return rows.map((row) => {
    const s = statsById.get(row.id);
    const items = bundleItemsByRow.get(row.id) ?? [];

    // Drop components whose product has since been deleted.
    const components: ResolvedComponent[] = items.flatMap((i) => {
      const c = componentsById.get(i.productId);
      return c ? [{ ...i, name: c.name, slug: c.slug, image: c.image, price: c.price, stock: c.stock }] : [];
    });

    const isBundle = components.length > 0;

    return {
      ...row,
      benefits: Array.isArray(row.benefits) ? row.benefits : [],
      gallery: Array.isArray(row.gallery) ? row.gallery : [],
      bundle_items: items,
      isBundle,
      components,
      available: isBundle ? bundleAvailability(components) : row.stock,
      separateValue: isBundle ? bundleSeparateValue(components) : 0,
      discountPercent: row.mrp > row.price ? Math.round(((row.mrp - row.price) / row.mrp) * 100) : 0,
      rating: Math.round(Number(s?.avg_rating ?? 0) * 10) / 10,
      reviewCount: Number(s?.review_count ?? 0),
    };
  });
}

/* ---------------- products ---------------- */

export async function getProducts(opts: { includeInactive?: boolean } = {}): Promise<Product[]> {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAGS.products, CACHE_TAGS.reviews);

  let query = db().from("products").select("*").order("id", { ascending: false });
  if (!opts.includeInactive) query = query.eq("active", true);

  return withStats(unwrap<ProductRow[]>(await query, "Failed to load products"));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAGS.products, CACHE_TAGS.reviews);

  const rows = unwrap<ProductRow[]>(
    await db().from("products").select("*").eq("slug", slug).limit(1),
    "Failed to load product"
  );
  return (await withStats(rows))[0] ?? null;
}

export async function getProductById(id: number): Promise<Product | null> {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAGS.products, CACHE_TAGS.reviews);

  if (!Number.isFinite(id)) return null;
  const rows = unwrap<ProductRow[]>(
    await db().from("products").select("*").eq("id", id).limit(1),
    "Failed to load product"
  );
  return (await withStats(rows))[0] ?? null;
}

/* ---------------- reviews ---------------- */

export async function getReviews(productId: number, approvedOnly = true): Promise<Review[]> {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAGS.reviews);

  let query = db().from("reviews").select("*").eq("product_id", productId).order("id", { ascending: false });
  if (approvedOnly) query = query.eq("approved", true);

  return unwrap<Review[]>(await query, "Failed to load reviews");
}

export async function getAllReviews(): Promise<Array<Review & { product_name: string }>> {
  const rows = unwrap<Array<Review & { products: { name: string } | null }>>(
    await db().from("reviews").select("*, products(name)").order("id", { ascending: false }),
    "Failed to load reviews"
  );
  return rows.map(({ products, ...r }) => ({ ...r, product_name: products?.name ?? "Unknown product" }));
}

export async function getApprovedReviewsAcrossStore(limit = 8): Promise<Array<Review & { product_slug: string }>> {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAGS.reviews);

  const rows = unwrap<Array<Review & { products: { slug: string } | null }>>(
    await db()
      .from("reviews")
      .select("*, products(slug)")
      .eq("approved", true)
      .order("rating", { ascending: false })
      .order("id", { ascending: false })
      .limit(limit),
    "Failed to load reviews"
  );
  return rows.map(({ products, ...r }) => ({ ...r, product_slug: products?.slug ?? "" }));
}

/** Counts how many reviews gave each star rating, from an already-loaded list. */
export function ratingBreakdown(reviews: Review[]): Record<number, number> {
  const map: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of reviews) if (map[r.rating] !== undefined) map[r.rating] += 1;
  return map;
}

/* ---------------- coupons ---------------- */

export async function getCoupons(): Promise<Coupon[]> {
  return unwrap<Coupon[]>(
    await db().from("coupons").select("*").order("id", { ascending: false }),
    "Failed to load coupons"
  );
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
  const rows = unwrap<Coupon[]>(
    await db().from("coupons").select("*").eq("code", code.trim().toUpperCase()).limit(1),
    "Failed to load coupon"
  );
  return rows[0] ?? null;
}

/* ---------------- orders ---------------- */

export async function getOrders(): Promise<Order[]> {
  return unwrap<Order[]>(
    await db().from("orders").select("*").order("id", { ascending: false }),
    "Failed to load orders"
  );
}

export async function getOrderByNo(orderNo: string): Promise<Order | null> {
  const rows = unwrap<Order[]>(
    await db().from("orders").select("*").eq("order_no", orderNo.trim()).limit(1),
    "Failed to load order"
  );
  return rows[0] ?? null;
}

/* ---------------- replacement requests ---------------- */

export async function getReplacementRequests(): Promise<ReplacementRequest[]> {
  return unwrap<ReplacementRequest[]>(
    await db().from("replacement_requests").select("*").order("id", { ascending: false }),
    "Failed to load replacement requests"
  );
}

/** The latest replacement request for one order, if there is one. */
export async function getReplacementForOrder(orderNo: string): Promise<ReplacementRequest | null> {
  const rows = unwrap<ReplacementRequest[]>(
    await db()
      .from("replacement_requests")
      .select("*")
      .eq("order_no", orderNo)
      .order("id", { ascending: false })
      .limit(1),
    "Failed to load replacement request"
  );
  return rows[0] ?? null;
}

/** Latest replacement request per order, for listing several orders at once. */
export async function getReplacementsByOrderNos(orderNos: string[]): Promise<Map<string, ReplacementRequest>> {
  if (orderNos.length === 0) return new Map();

  const rows = unwrap<ReplacementRequest[]>(
    await db()
      .from("replacement_requests")
      .select("*")
      .in("order_no", orderNos)
      .order("id", { ascending: false }),
    "Failed to load replacement requests"
  );

  const map = new Map<string, ReplacementRequest>();
  for (const r of rows) if (!map.has(r.order_no)) map.set(r.order_no, r);
  return map;
}

/* ---------------- dashboard ---------------- */

export async function dashboardStats() {
  const orders = unwrap<Array<Pick<Order, "total" | "payment_method" | "status">>>(
    await db().from("orders").select("total, payment_method, status").neq("status", "cancelled"),
    "Failed to load order stats"
  );

  const productCount = await db().from("products").select("id", { count: "exact", head: true });
  const pendingReviews = await db()
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("approved", false);
  // Anything still waiting on us: to review, to pick up, or to dispatch.
  const openReplacements = await db()
    .from("replacement_requests")
    .select("id", { count: "exact", head: true })
    .in("status", ["open", "approved", "picked_up"]);

  return {
    orders: orders.length,
    revenue: orders.reduce((sum, o) => sum + o.total, 0),
    cod: orders.filter((o) => o.payment_method === "cod").length,
    online: orders.filter((o) => o.payment_method === "online").length,
    products: productCount.count ?? 0,
    pendingReviews: pendingReviews.count ?? 0,
    openReplacements: openReplacements.count ?? 0,
  };
}
