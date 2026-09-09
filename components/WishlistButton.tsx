"use client";

import Icon from "./Icon";
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
        className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ink/60 transition-colors hover:text-brand-700"
      >
        <Icon
          name="heart"
          size={17}
          className={saved ? "fill-red-500 text-red-500" : "text-ink/40"}
        />
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
      className="absolute right-2.5 top-2.5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-soft backdrop-blur transition-colors hover:bg-white"
    >
      <Icon
        name="heart"
        size={16}
        className={saved ? "fill-red-500 text-red-500" : "text-ink/35"}
      />
    </button>
  );
}

export default WishlistButton;
