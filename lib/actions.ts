"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { ADMIN_PASSWORD, clearAdminCookie, isAdmin, setAdminCookie } from "./auth";
import { CACHE_TAGS } from "./cache-tags";
import { parseBundleItems } from "./bundle";
import { sendReplacementStatusEmail, sendShippingUpdate } from "./notify";
import { releaseOrderStock, reserveOrderStock } from "./orders";
import { getOrderByNo } from "./queries";
import { db, unwrap } from "./supabase";
import { ALL_REPLACEMENT_STATUSES } from "./replacement";
import type { ReplacementStatus } from "./types";

async function guard() {
  if (!(await isAdmin())) redirect("/admin/login");
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

async function uniqueSlug(base: string, ignoreId?: number) {
  const root = base || "product";
  let slug = root;

  for (let n = 2; n < 100; n++) {
    const rows = unwrap<Array<{ id: number }>>(
      await db().from("products").select("id").eq("slug", slug).limit(1),
      "Failed to check slug"
    );
    if (rows.length === 0 || rows[0].id === ignoreId) return slug;
    slug = `${root}-${n}`;
  }

  return `${root}-${Date.now()}`;
}

function lines(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/* ---------------- auth ---------------- */

export async function loginAction(_prev: string | null, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (password !== ADMIN_PASSWORD) return "Incorrect password.";
  await setAdminCookie();
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminCookie();
  redirect("/admin/login");
}

/* ---------------- products ---------------- */

export async function saveProductAction(formData: FormData) {
  await guard();

  const id = Number(formData.get("id") ?? 0);
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const customSlug = String(formData.get("slug") ?? "").trim();
  const slug = await uniqueSlug(slugify(customSlug || name), id || undefined);

  const gallery = lines(formData.get("gallery"));
  const image = String(formData.get("image") ?? "").trim() || gallery[0] || "/img/product-1.svg";

  // Combo contents arrive as JSON from the bundle builder. A product that
  // contains others keeps no stock of its own — availability is derived from
  // the components, so we pin its own stock column to 0 to avoid confusion.
  let bundleItems: ReturnType<typeof parseBundleItems> = [];
  try {
    bundleItems = parseBundleItems(JSON.parse(String(formData.get("bundle_items") ?? "[]")));
  } catch {
    bundleItems = [];
  }
  if (id) bundleItems = bundleItems.filter((c) => c.productId !== id);

  const data = {
    slug,
    name,
    subtitle: String(formData.get("subtitle") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    benefits: lines(formData.get("benefits")),
    ingredients: String(formData.get("ingredients") ?? "").trim(),
    how_to_use: String(formData.get("how_to_use") ?? "").trim(),
    mrp: Math.max(0, Math.round(Number(formData.get("mrp") ?? 0))),
    price: Math.max(0, Math.round(Number(formData.get("price") ?? 0))),
    image,
    gallery: gallery.length ? gallery : [image],
    stock: bundleItems.length > 0 ? 0 : Math.max(0, Math.round(Number(formData.get("stock") ?? 0))),
    active: Boolean(formData.get("active")),
    bundle_items: bundleItems,
  };

  const res = id
    ? await db().from("products").update(data).eq("id", id)
    : await db().from("products").insert(data);

  if (res.error) {
    // The database trigger rejects a combo inside a combo.
    if (/combo/i.test(res.error.message)) {
      redirect(`/admin/products?error=${encodeURIComponent(res.error.message)}`);
    }
    throw new Error(`Failed to save product: ${res.error.message}`);
  }

  updateTag(CACHE_TAGS.products);
  redirect("/admin/products?saved=1");
}

export async function deleteProductAction(formData: FormData) {
  await guard();

  const id = Number(formData.get("id") ?? 0);
  if (id) {
    // Deleting a product that a combo depends on would silently break that combo.
    // `.contains()` serialises the array in a way PostgREST rejects on jsonb, so
    // the containment operator is passed explicitly with a JSON string.
    const usedIn = unwrap<Array<{ name: string }>>(
      await db()
        .from("products")
        .select("name")
        .filter("bundle_items", "cs", JSON.stringify([{ productId: id }])),
      "Failed to check combos"
    );
    if (usedIn.length > 0) {
      redirect(
        `/admin/products?error=${encodeURIComponent(
          `This product is part of the combo "${usedIn[0].name}". Remove it from that combo first.`
        )}`
      );
    }

    // reviews cascade automatically via the foreign key
    const res = await db().from("products").delete().eq("id", id);
    if (res.error) throw new Error(`Failed to delete product: ${res.error.message}`);
  }

  updateTag(CACHE_TAGS.products);
  redirect("/admin/products?deleted=1");
}

/* ---------------- coupons ---------------- */

export async function saveCouponAction(formData: FormData) {
  await guard();

  const id = Number(formData.get("id") ?? 0);
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!code) return;

  const data = {
    code,
    type: formData.get("type") === "flat" ? "flat" : "percent",
    value: Math.max(0, Math.round(Number(formData.get("value") ?? 0))),
    min_order: Math.max(0, Math.round(Number(formData.get("min_order") ?? 0))),
    max_discount: Math.max(0, Math.round(Number(formData.get("max_discount") ?? 0))),
    expires_at: String(formData.get("expires_at") ?? "").trim() || null,
    usage_limit: Math.max(0, Math.round(Number(formData.get("usage_limit") ?? 0))),
    active: Boolean(formData.get("active")),
  };

  const res = id
    ? await db().from("coupons").update(data).eq("id", id)
    : await db().from("coupons").upsert(data, { onConflict: "code" });
  if (res.error) throw new Error(`Failed to save coupon: ${res.error.message}`);

  revalidatePath("/admin/coupons");
}

export async function deleteCouponAction(formData: FormData) {
  await guard();

  const id = Number(formData.get("id") ?? 0);
  if (id) {
    const res = await db().from("coupons").delete().eq("id", id);
    if (res.error) throw new Error(`Failed to delete coupon: ${res.error.message}`);
  }

  revalidatePath("/admin/coupons");
}

/* ---------------- reviews ---------------- */

export async function setReviewApprovalAction(formData: FormData) {
  await guard();

  const id = Number(formData.get("id") ?? 0);
  const approved = formData.get("approved") === "1";
  if (id) {
    const res = await db().from("reviews").update({ approved }).eq("id", id);
    if (res.error) throw new Error(`Failed to update review: ${res.error.message}`);
  }

  updateTag(CACHE_TAGS.reviews);
}

export async function deleteReviewAction(formData: FormData) {
  await guard();

  const id = Number(formData.get("id") ?? 0);
  if (id) {
    const res = await db().from("reviews").delete().eq("id", id);
    if (res.error) throw new Error(`Failed to delete review: ${res.error.message}`);
  }

  updateTag(CACHE_TAGS.reviews);
}

export async function addReviewAsAdminAction(formData: FormData) {
  await guard();

  const productId = Number(formData.get("product_id") ?? 0);
  const name = String(formData.get("name") ?? "").trim();
  const rating = Math.min(5, Math.max(1, Math.round(Number(formData.get("rating") ?? 5))));
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!productId || !name || !body) return;

  const res = await db()
    .from("reviews")
    .insert({ product_id: productId, name, email: "", rating, title, body, approved: true });
  if (res.error) throw new Error(`Failed to add review: ${res.error.message}`);

  updateTag(CACHE_TAGS.reviews);
}

/* ---------------- orders ---------------- */

export async function updateOrderAction(formData: FormData) {
  await guard();

  const id = Number(formData.get("id") ?? 0);
  const orderNo = String(formData.get("order_no") ?? "").trim();
  const status = String(formData.get("status") ?? "");
  const paymentStatus = String(formData.get("payment_status") ?? "");
  const trackingNumber = String(formData.get("tracking_number") ?? "").trim();
  const courier = String(formData.get("courier") ?? "").trim();

  const allowed = ["placed", "confirmed", "shipped", "delivered", "cancelled", "replacement", "pending_payment"];
  if (!id || !orderNo || !allowed.includes(status)) return;

  const before = await getOrderByNo(orderNo);
  if (!before) return;

  const res = await db()
    .from("orders")
    .update({
      status,
      payment_status: ["pending", "paid", "failed"].includes(paymentStatus) ? paymentStatus : "pending",
      tracking_number: trackingNumber,
      courier,
    })
    .eq("id", id);
  if (res.error) throw new Error(`Failed to update order: ${res.error.message}`);

  // Cancelling puts stock and coupon usage back; un-cancelling takes them again.
  // Both RPCs are no-ops if the order is already in that state.
  if (status === "cancelled" && before.status !== "cancelled") {
    // Admins may cancel from any status — a shipped parcel can still be recalled.
    await db().from("orders").update({ cancelled_at: new Date().toISOString(), cancelled_by: "admin" }).eq("id", id);
    await releaseOrderStock(orderNo);
  } else if (status !== "cancelled" && before.status === "cancelled") {
    await reserveOrderStock(orderNo);
  }

  // Tell the customer the moment a tracking number appears.
  if (trackingNumber && trackingNumber !== before.tracking_number) {
    const after = await getOrderByNo(orderNo);
    if (after) void sendShippingUpdate(after);
  }

  // Cancelling or reinstating an order moves stock, so the storefront
  // copy of the products has to be expired too.
  updateTag(CACHE_TAGS.products);
  revalidatePath("/admin/orders");
}

/* ---------------- replacement requests ---------------- */

export async function updateReplacementAction(formData: FormData) {
  await guard();

  const id = Number(formData.get("id") ?? 0);
  const status = String(formData.get("status") ?? "") as ReplacementStatus;
  const adminNote = String(formData.get("admin_note") ?? "").trim();
  const customerMessage = String(formData.get("customer_message") ?? "").trim().slice(0, 500);
  const courier = String(formData.get("courier") ?? "").trim().slice(0, 60);
  const trackingNumber = String(formData.get("tracking_number") ?? "").trim().slice(0, 60);

  if (!id || !ALL_REPLACEMENT_STATUSES.includes(status)) return;

  const before = unwrap<Array<{ status: string; order_no: string; name: string }>>(
    await db().from("replacement_requests").select("status, order_no, name").eq("id", id).limit(1),
    "Failed to load request"
  )[0];
  if (!before) return;

  const now = new Date().toISOString();
  const changed = before.status !== status;

  // Stamp each milestone the first time it is reached, so the customer sees
  // real dates rather than one "last updated" timestamp.
  const stamps: Record<string, string> = {};
  if (changed && status === "picked_up") stamps.picked_up_at = now;
  if (changed && status === "shipped") stamps.shipped_at = now;
  if (changed && status === "delivered") stamps.delivered_at = now;

  const res = await db()
    .from("replacement_requests")
    .update({
      status,
      admin_note: adminNote,
      customer_message: customerMessage,
      courier,
      tracking_number: trackingNumber,
      updated_at: now,
      ...stamps,
    })
    .eq("id", id);
  if (res.error) throw new Error(`Failed to update request: ${res.error.message}`);

  // Only email on a real change, so re-saving a note does not spam the customer.
  if (changed) {
    const order = await getOrderByNo(before.order_no);
    if (order?.email) {
      void sendReplacementStatusEmail({
        to: order.email,
        name: before.name,
        orderNo: before.order_no,
        status,
        customerMessage,
        courier,
        trackingNumber,
      });
    }
  }

  revalidatePath("/", "layout");
}
