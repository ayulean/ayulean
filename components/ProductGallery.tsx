"use client";

import Image from "next/image";
import { useState, ViewTransition } from "react";

export function ProductGallery({
  images,
  alt,
  morphName,
}: {
  images: string[];
  alt: string;
  morphName?: string;
}) {
  const list = images.length ? images : ["/img/product-1.svg"];
  const [active, setActive] = useState(0);

  const frame = (
    <div className="group relative aspect-square overflow-hidden rounded-3xl border border-brand-100 bg-brand-50">
      {/* Re-keyed so each thumbnail swap fades the new photo in. */}
      <Image
        key={active}
        src={list[active]}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 560px, 100vw"
        className="anim-fade-in object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        priority
      />
    </div>
  );

  return (
    <div>
      {morphName ? (
        <ViewTransition name={morphName} share="morph" default="none">
          {frame}
        </ViewTransition>
      ) : (
        frame
      )}

      {list.length > 1 && (
        <div className="mt-4 flex gap-3">
          {list.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Image ${i + 1}`}
              aria-current={i === active}
              className={`relative h-20 w-20 overflow-hidden rounded-xl border-2 transition-all duration-300 ease-out hover:-translate-y-0.5 ${
                i === active
                  ? "border-brand-500 shadow-md shadow-brand-600/20"
                  : "border-brand-100 opacity-70 hover:border-brand-300 hover:opacity-100"
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
