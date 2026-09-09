import { isAdmin } from "@/lib/auth";
import { uploadProductImage } from "@/lib/storage";

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "No file received." }, { status: 400 });

  const result = await uploadProductImage(file);
  if (!result.ok) return Response.json({ error: result.error }, { status: 400 });

  return Response.json({ ok: true, url: result.url });
}
