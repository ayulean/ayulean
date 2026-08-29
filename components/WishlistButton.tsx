"use client";

import { useWishlist, type WishlistItem } from "./WishlistProvider";

export function WishlistButton({
  item,
  variant = "icon",
}: {
  item: WishlistItem;
  variant?: "icon" | "full";
}) {
  const { has, toggle, ready } = useWishlist();
  const saved = ready && has(item.productId);

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={() => toggle(item)}
        aria-pressed={saved}
        className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-ink/65 hover:text-brand-700"
      >
        <span aria-hidden="true" className={saved ? "text-red-500" : ""}>
          {saved ? "♥" : "♡"}
        </span>
        {saved ? "Saved to wishlist" : "Save to wishlist"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle(item)}
      aria-label={saved ? `Remove ${item.name} from wishlist` : `Save ${item.name} to wishlist`}
      aria-pressed={saved}
      className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg shadow-sm backdrop-blur transition hover:bg-white"
    >
      <span aria-hidden="true" className={saved ? "text-red-500" : "text-ink/35"}>
        {saved ? "♥" : "♡"}
      </span>
    </button>
  );
}

export default WishlistButton;
