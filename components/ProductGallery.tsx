"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const list = images.length ? images : ["/img/product-1.svg"];
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-brand-100 bg-brand-50">
        <Image src={list[active]} alt={alt} fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" priority />
      </div>

      {list.length > 1 && (
        <div className="mt-4 flex gap-3">
          {list.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Image ${i + 1}`}
              aria-current={i === active}
              className={`relative h-20 w-20 overflow-hidden rounded-xl border-2 transition ${
                i === active ? "border-brand-500" : "border-brand-100 hover:border-brand-300"
              }`}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductGallery;
