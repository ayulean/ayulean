import { db, unwrap } from "./supabase";
import type { Coupon, Order, Product, ProductRow, ReplacementRequest, Review } from "./types";

type StatsRow = { product_id: number; review_count: number; avg_rating: number | string };

/** Attaches rating stats and the derived discount percentage to product rows. */
async function withStats(rows: ProductRow[]): Promise<Product[]> {
  if (rows.length === 0) return [];

  const stats = unwrap<StatsRow[]>(
    await db()
      .from("product_stats")
      .select("product_id, review_count, avg_rating")
      .in("product_id", rows.map((r) => r.id)),
    "Failed to load product stats"
  );

  const byId = new Map(stats.map((s) => [s.product_id, s]));

  return rows.map((row) => {
    const s = byId.get(row.id);
    return {
      ...row,
      benefits: Array.isArray(row.benefits) ? row.benefits : [],
      gallery: Array.isArray(row.gallery) ? row.gallery : [],
      discountPercent: row.mrp > row.price ? Math.round(((row.mrp - row.price) / row.mrp) * 100) : 0,
      rating: Math.round(Number(s?.avg_rating ?? 0) * 10) / 10,
      reviewCount: Number(s?.review_count ?? 0),
    };
  });
}

/* ---------------- products ---------------- */

export async function getProducts(opts: { includeInactive?: boolean } = {}): Promise<Product[]> {
  let query = db().from("products").select("*").order("id", { ascending: false });
  if (!opts.includeInactive) query = query.eq("active", true);

  return withStats(unwrap<ProductRow[]>(await query, "Failed to load products"));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const rows = unwrap<ProductRow[]>(
    await db().from("products").select("*").eq("slug", slug).limit(1),
    "Failed to load product"
  );
  return (await withStats(rows))[0] ?? null;
}

export async function getProductById(id: number): Promise<Product | null> {
  if (!Number.isFinite(id)) return null;
  const rows = unwrap<ProductRow[]>(
    await db().from("products").select("*").eq("id", id).limit(1),
    "Failed to load product"
  );
  return (await withStats(rows))[0] ?? null;
}

/* ---------------- reviews ---------------- */

export async function getReviews(productId: number, approvedOnly = true): Promise<Review[]> {
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
  const openReplacements = await db()
    .from("replacement_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "open");

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
