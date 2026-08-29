"use client";

import { useSyncExternalStore } from "react";
import type { CartItem } from "@/lib/types";

const KEY = "ayulean_cart_v1";

type Snapshot = { items: CartItem[]; ready: boolean };

const EMPTY: Snapshot = { items: [], ready: false };

let snapshot: Snapshot = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function readStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as CartItem[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // If storage is blocked, the cart simply lives for this session only
    return [];
  }
}

function commit(items: CartItem[]) {
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

  // Keep this tab in sync when the cart changes in another tab
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

export const cart = {
  add(item: Omit<CartItem, "qty">, qty = 1) {
    const items = snapshot.items;
    const found = items.find((p) => p.productId === item.productId);
    commit(
      found
        ? items.map((p) => (p.productId === item.productId ? { ...p, qty: Math.min(10, p.qty + qty) } : p))
        : [...items, { ...item, qty }]
    );
  },
  setQty(productId: number, qty: number) {
    commit(
      qty <= 0
        ? snapshot.items.filter((p) => p.productId !== productId)
        : snapshot.items.map((p) => (p.productId === productId ? { ...p, qty } : p))
    );
  },
  remove(productId: number) {
    commit(snapshot.items.filter((p) => p.productId !== productId));
  },
  clear() {
    commit([]);
  },
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useCart() {
  const { items, ready } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    items,
    ready,
    count: items.reduce((n, i) => n + i.qty, 0),
    subtotal: items.reduce((n, i) => n + i.price * i.qty, 0),
    ...cart,
  };
}
