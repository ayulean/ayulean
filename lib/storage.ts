import { db } from "./supabase";

export const PRODUCT_BUCKET = "product-images";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 5 * 1024 * 1024;

export type UploadResult = { ok: true; url: string } | { ok: false; error: string };

/** Uploads one product image to Supabase Storage and returns its public URL. */
export async function uploadProductImage(file: File): Promise<UploadResult> {
  if (!ALLOWED.includes(file.type)) {
    return { ok: false, error: "Please upload a JPG, PNG, WebP or AVIF image." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "That image is larger than 5 MB. Please compress it first." };
  }

  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await db()
    .storage.from(PRODUCT_BUCKET)
    .upload(path, await file.arrayBuffer(), { contentType: file.type, upsert: false });

  if (error) {
    console.error("Image upload failed", error);
    return { ok: false, error: "The image could not be uploaded. Please try again." };
  }

  const { data } = db().storage.from(PRODUCT_BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
