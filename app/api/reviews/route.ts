import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { getProductById } from "@/lib/queries";
import { shouldAutoApprove } from "@/lib/reviews";
import { allowRequest, clientIp } from "@/lib/ratelimit";
import { db } from "@/lib/supabase";

export async function POST(req: Request) {
  // 3 reviews per IP per hour.
  if (!(await allowRequest(`review:${clientIp(req)}`, 3, 3600))) {
    return Response.json(
      { error: "You have submitted several reviews already. Please try again later." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const productId = Number(body.productId);
  const rating = Number(body.rating);
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const title = String(body.title ?? "").trim();
  const text = String(body.body ?? "").trim();

  if (!(await getProductById(productId))) return Response.json({ error: "Product not found." }, { status: 404 });
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    return Response.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
  if (name.length < 2) return Response.json({ error: "Please enter your name." }, { status: 400 });
  if (text.length < 5)
    return Response.json({ error: "Please write a little more in your review." }, { status: 400 });

  // Reviews publish immediately. Only link-carrying ones wait for a look.
  const autoApprove = shouldAutoApprove({ name, title, body: text });

  const { error } = await db().from("reviews").insert({
    product_id: productId,
    name: name.slice(0, 60),
    email: email.slice(0, 120),
    rating,
    title: title.slice(0, 80),
    body: text.slice(0, 1500),
    approved: autoApprove,
  });

  if (error) {
    console.error("Review insert failed", error);
    return Response.json({ error: "Your review could not be submitted." }, { status: 500 });
  }

  // Auto-approved reviews go live at once, so the cached list has to go.
  if (autoApprove) revalidateTag(CACHE_TAGS.reviews, "max");

  return Response.json({
    ok: true,
    message: autoApprove
      ? "Thank you! Your review is now live on this page."
      : "Thank you! Your review has been submitted and will appear shortly.",
  });
}
