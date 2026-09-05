import type { Metadata } from "next";
import { deleteCouponAction, saveCouponAction } from "@/lib/actions";
import { money } from "@/lib/pricing";
import { getCoupons } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Coupons", robots: { index: false } };

const field =
  "mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

export default async function AdminCouponsPage() {
  const coupons = await getCoupons();

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-brand-900">Coupons</h1>
      <p className="mt-1 text-sm text-ink/55">Create discount codes — customers apply them at checkout.</p>

      <div className="mt-6 grid gap-6 xl:grid-cols-[380px_1fr]">
        <section className="h-fit rounded-2xl border border-brand-100 bg-white p-6">
          <h2 className="font-display text-lg font-bold text-brand-800">New coupon</h2>

          <form action={saveCouponAction} className="mt-4 space-y-4">
            <label className="block text-sm font-medium">
              Code *
              <input name="code" required placeholder="ANGAD10" className={`${field} uppercase`} />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Type
                <select name="type" defaultValue="percent" className={field}>
                  <option value="percent">Percent (%)</option>
                  <option value="flat">Flat (₹)</option>
                </select>
              </label>
              <label className="text-sm font-medium">
                Value *
                <input name="value" type="number" min={0} required defaultValue={10} className={field} />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Minimum order (₹)
                <input name="min_order" type="number" min={0} defaultValue={0} className={field} />
              </label>
              <label className="text-sm font-medium">
                Max discount (₹, 0 = no cap)
                <input name="max_discount" type="number" min={0} defaultValue={0} className={field} />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Expiry date
                <input name="expires_at" type="date" className={field} />
              </label>
              <label className="text-sm font-medium">
                Usage limit (0 = unlimited)
                <input name="usage_limit" type="number" min={0} defaultValue={0} className={field} />
              </label>
            </div>

            <label className="flex items-center gap-2.5 text-sm font-medium">
              <input type="checkbox" name="active" defaultChecked className="h-4 w-4" />
              Active
            </label>

            <button
              type="submit"
              className="w-full rounded-full bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700"
            >
              Save coupon
            </button>
          </form>
        </section>

        <section className="overflow-x-auto rounded-2xl border border-brand-100 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-100 text-left text-xs uppercase text-ink/50">
                <th className="p-4">Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Min order</th>
                <th className="p-4">Used</th>
                <th className="p-4">Expiry</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-50">
              {coupons.map((c) => (
                <tr key={c.id}>
                  <td className="p-4 font-mono font-semibold text-brand-800">{c.code}</td>
                  <td className="p-4">
                    {c.type === "percent" ? `${c.value}%` : money(c.value)}
                    {c.max_discount > 0 && <span className="text-xs text-ink/45"> (max {money(c.max_discount)})</span>}
                  </td>
                  <td className="p-4">{c.min_order ? money(c.min_order) : "—"}</td>
                  <td className="p-4">
                    {c.used_count}
                    {c.usage_limit > 0 && <span className="text-ink/45"> / {c.usage_limit}</span>}
                  </td>
                  <td className="p-4">{c.expires_at ? new Date(c.expires_at).toLocaleDateString("en-IN") : "—"}</td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.active ? "bg-brand-100 text-brand-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {c.active ? "Active" : "Off"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <form action={saveCouponAction}>
                        <input type="hidden" name="id" value={c.id} />
                        <input type="hidden" name="code" value={c.code} />
                        <input type="hidden" name="type" value={c.type} />
                        <input type="hidden" name="value" value={c.value} />
                        <input type="hidden" name="min_order" value={c.min_order} />
                        <input type="hidden" name="max_discount" value={c.max_discount} />
                        <input type="hidden" name="expires_at" value={c.expires_at ?? ""} />
                        <input type="hidden" name="usage_limit" value={c.usage_limit} />
                        {!c.active && <input type="hidden" name="active" value="on" />}
                        <button type="submit" className="text-xs font-semibold text-brand-600 hover:underline">
                          {c.active ? "Disable" : "Enable"}
                        </button>
                      </form>
                      <form action={deleteCouponAction}>
                        <input type="hidden" name="id" value={c.id} />
                        <button type="submit" className="text-xs text-red-600 hover:underline">Delete</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {coupons.length === 0 && <p className="p-10 text-center text-sm text-ink/50">No coupons yet.</p>}
        </section>
      </div>
    </>
  );
}
