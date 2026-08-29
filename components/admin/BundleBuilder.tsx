"use client";

import { useMemo, useState } from "react";
import { bundleAvailability, bundleSeparateValue } from "@/lib/bundle";
import { money } from "@/lib/pricing";
import type { BundleComponent } from "@/lib/types";

export type BuilderProduct = {
  id: number;
  name: string;
  price: number;
  stock: number;
  isBundle: boolean;
  active: boolean;
};

const PACK_SIZES = [2, 3, 4, 6, 12];

/**
 * Picks the products that make up a combo. The chosen list is written to a
 * hidden input as JSON, so the surrounding server action needs no client state.
 */
export function BundleBuilder({
  products,
  initial,
  editingId,
}: {
  products: BuilderProduct[];
  initial: BundleComponent[];
  editingId?: number;
}) {
  const [items, setItems] = useState<BundleComponent[]>(initial);

  // A combo may not contain another combo, or itself.
  const selectable = useMemo(
    () => products.filter((p) => !p.isBundle && p.id !== editingId),
    [products, editingId]
  );

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const resolved = items.flatMap((i) => {
    const p = byId.get(i.productId);
    return p ? [{ ...i, name: p.name, price: p.price, stock: p.stock, active: p.active }] : [];
  });

  const separate = bundleSeparateValue(resolved);
  const canMake = resolved.length > 0 ? bundleAvailability(resolved) : 0;

  function add(productId: number) {
    if (!productId || items.some((i) => i.productId === productId)) return;
    setItems((prev) => [...prev, { productId, qty: 1 }]);
  }

  function setQty(productId: number, qty: number) {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => (i.productId === productId ? { ...i, qty: Math.min(50, qty) } : i))
    );
  }

  return (
    <section className="rounded-2xl border border-brand-100 bg-white p-6">
      <input type="hidden" name="bundle_items" value={JSON.stringify(items)} />

      <h2 className="font-display text-lg font-bold text-brand-800">Combo contents</h2>
      <p className="mt-1 text-xs leading-relaxed text-ink/55">
        Leave this empty for a normal product. Add two or more products to turn this into a combo —
        selling one combo then removes stock from each product inside it, and the combo&rsquo;s own
        stock field is ignored.
      </p>

      {selectable.length === 0 ? (
        <p className="mt-4 rounded-lg bg-cream p-3 text-sm leading-relaxed text-ink/60">
          There is no product to build from yet. Add the single item first — if you do not want to sell it on
          its own, save it with <strong>&ldquo;Show live on the website&rdquo; unchecked</strong>. It then acts
          purely as a stock item that packs and combos draw from.
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          <select
            defaultValue=""
            aria-label="Add a product to this combo"
            onChange={(e) => {
              add(Number(e.target.value));
              e.target.value = "";
            }}
            className="flex-1 rounded-lg border border-brand-200 bg-white px-3 py-2.5 text-sm"
          >
            <option value="">+ Add a product to this combo…</option>
            {selectable
              .filter((p) => !items.some((i) => i.productId === p.id))
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.active ? "" : " (hidden — stock item)"} — {money(p.price)} ({p.stock} in stock)
                </option>
              ))}
          </select>
        </div>
      )}

      {resolved.length > 0 && (
        <>
          <ul className="mt-4 divide-y divide-brand-50 rounded-xl border border-brand-100">
            {resolved.map((c) => (
              <li key={c.productId} className="flex flex-wrap items-center gap-3 p-3">
                <span className="flex-1 text-sm font-medium text-brand-800">{c.name}</span>
                <span className="text-xs text-ink/50">{money(c.price)} each · {c.stock} in stock</span>

                <span className="inline-flex items-center rounded-full border border-brand-200">
                  <button
                    type="button"
                    aria-label={`Fewer ${c.name}`}
                    onClick={() => setQty(c.productId, c.qty - 1)}
                    className="h-8 w-8 rounded-l-full font-bold text-brand-700 hover:bg-brand-50"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{c.qty}</span>
                  <button
                    type="button"
                    aria-label={`More ${c.name}`}
                    onClick={() => setQty(c.productId, c.qty + 1)}
                    className="h-8 w-8 rounded-r-full font-bold text-brand-700 hover:bg-brand-50"
                  >
                    +
                  </button>
                </span>

                <button
                  type="button"
                  onClick={() => setQty(c.productId, 0)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <dl className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-brand-50 p-3">
              <dt className="text-xs text-ink/55">Bought separately</dt>
              <dd className="mt-0.5 font-bold text-brand-800">{money(separate)}</dd>
            </div>
            <div className="rounded-xl bg-brand-50 p-3">
              <dt className="text-xs text-ink/55">Combos you can make</dt>
              <dd className="mt-0.5 font-bold text-brand-800">{canMake}</dd>
            </div>
            <div className="rounded-xl bg-brand-50 p-3">
              <dt className="text-xs text-ink/55">Items inside</dt>
              <dd className="mt-0.5 font-bold text-brand-800">
                {resolved.reduce((n, c) => n + c.qty, 0)}
              </dd>
            </div>
          </dl>

          {resolved.length === 1 && (
            <div className="mt-4 rounded-xl bg-cream p-4">
              <p className="text-sm font-medium text-brand-800">This is a multipack</p>
              <p className="mt-1 text-xs leading-relaxed text-ink/60">
                One product, sold {resolved[0].qty} at a time. Pick a pack size:
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {PACK_SIZES.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setQty(resolved[0].productId, n)}
                    aria-pressed={resolved[0].qty === n}
                    className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                      resolved[0].qty === n
                        ? "bg-brand-600 text-white"
                        : "border border-brand-300 text-brand-700 hover:bg-brand-50"
                    }`}
                  >
                    Pack of {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="mt-3 text-xs text-ink/55">
            Set the combo&rsquo;s selling price below. Put <strong>{money(separate)}</strong> in the MRP field so
            customers can see what they save.
          </p>
        </>
      )}
    </section>
  );
}

export default BundleBuilder;
