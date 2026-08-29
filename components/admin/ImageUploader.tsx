"use client";

import Image from "next/image";
import { useRef, useState } from "react";

/**
 * Uploads images to Supabase Storage and appends their public URLs into the
 * main-image and gallery fields of the product form.
 */
export function ImageUploader({
  mainInputId,
  galleryInputId,
}: {
  mainInputId: string;
  galleryInputId: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [uploaded, setUploaded] = useState<string[]>([]);

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError("");

    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const json = await res.json().catch(() => ({ error: "Upload failed." }));
      if (!res.ok) {
        setError(json.error ?? "Upload failed.");
        break;
      }
      urls.push(json.url);
    }

    if (urls.length > 0) {
      const main = document.getElementById(mainInputId) as HTMLInputElement | null;
      const gallery = document.getElementById(galleryInputId) as HTMLTextAreaElement | null;

      if (main && (!main.value || main.value.startsWith("/img/product-"))) main.value = urls[0];
      if (gallery) {
        const existing = gallery.value
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l && !l.startsWith("/img/product-"));
        gallery.value = [...existing, ...urls].join("\n");
      }
      setUploaded((prev) => [...prev, ...urls]);
    }

    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="mt-4 rounded-xl border border-dashed border-brand-300 bg-brand-50/50 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {busy ? "Uploading…" : "Upload images"}
        </button>
        <span className="text-xs text-ink/55">JPG, PNG, WebP or AVIF · up to 5 MB each</span>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        className="hidden"
        onChange={(e) => onFiles(e.target.files)}
      />

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {uploaded.length > 0 && (
        <>
          <p className="mt-3 text-xs font-medium text-brand-700">
            ✓ {uploaded.length} uploaded — the fields below are filled in. Remember to save.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {uploaded.map((url) => (
              <span key={url} className="relative h-16 w-16 overflow-hidden rounded-lg border border-brand-200">
                <Image src={url} alt="" fill sizes="64px" className="object-cover" unoptimized />
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ImageUploader;
