"use client";

import { useSyncExternalStore } from "react";

export type WishlistItem = {
  productId: number;
  slug: string;
  name: string;
  image: string;
  price: number;
  mrp: number;
};

const KEY = "ayulean_wishlist_v1";

type Snapshot = { items: WishlistItem[]; ready: boolean };
const EMPTY: Snapshot = { items: [], ready: false };

let snapshot: Snapshot = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function readStorage(): WishlistItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as WishlistItem[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function commit(items: WishlistItem[]) {
  snapshot = { items, ready: true };
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
  for (const l of listeners) l();
}

function subscribe(onChange: () => void) {
  if (!hydrated) {
    hydrated = true;
    snapshot = { items: readStorage(), ready: true };
  }
  listeners.add(onChange);

  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    snapshot = { items: readStorage(), ready: true };
    for (const l of listeners) l();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => snapshot;
const getServerSnapshot = () => EMPTY;

export const wishlist = {
  toggle(item: WishlistItem) {
    const exists = snapshot.items.some((i) => i.productId === item.productId);
    commit(exists ? snapshot.items.filter((i) => i.productId !== item.productId) : [...snapshot.items, item]);
  },
  remove(productId: number) {
    commit(snapshot.items.filter((i) => i.productId !== productId));
  },
  clear() {
    commit([]);
  },
};

export function useWishlist() {
  const { items, ready } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    items,
    ready,
    count: items.length,
    has: (productId: number) => items.some((i) => i.productId === productId),
    ...wishlist,
  };
}
