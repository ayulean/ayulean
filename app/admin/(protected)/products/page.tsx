import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { deleteProductAction } from "@/lib/actions";
import { money } from "@/lib/pricing";
import { getProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Products", robots: { index: false } };

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  const sp = await searchParams;
  const products = await getProducts({ includeInactive: true });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-900">Products</h1>
          <p className="mt-1 text-sm text-ink/55">Add products, change price and discount, or hide them from the store.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          + New product
        </Link>
      </div>

      {sp.saved && <p className="mt-4 rounded-lg bg-brand-100 p-3 text-sm text-brand-800">✓ Product saved.</p>}
      {sp.deleted && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">Product deleted.</p>}
      {typeof sp.error === "string" && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{sp.error}</p>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-brand-100 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-100 text-left text-xs uppercase text-ink/50">
              <th className="p-4">Product</th>
              <th className="p-4">Price</th>
              <th className="p-4">Discount</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Rating</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-50">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-brand-50">
                      <Image src={p.image} alt="" fill sizes="48px" className="object-cover" />
                    </span>
                    <span>
                      <span className="block font-medium text-brand-800">
                        {p.name}
                        {p.isBundle && (
                          <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                            COMBO
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-ink/45">/{p.slug}</span>
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="font-semibold">{money(p.price)}</span>
                  {p.mrp > p.price && <span className="ml-1 text-xs text-ink/40 line-through">{money(p.mrp)}</span>}
                </td>
                <td className="p-4">{p.discountPercent > 0 ? `${p.discountPercent}%` : "—"}</td>
                <td className="p-4">
                  <span className={p.available === 0 ? "font-bold text-red-600" : ""}>{p.available}</span>
                  {p.isBundle && (
                    <span className="block text-[11px] text-ink/45">from components</span>
                  )}
                </td>
                <td className="p-4">{p.reviewCount ? `${p.rating} (${p.reviewCount})` : "—"}</td>
                <td className="p-4">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.active ? "bg-brand-100 text-brand-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {p.active ? "Live" : "Hidden"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/product/${p.slug}`} className="text-xs text-ink/50 hover:text-brand-600">View</Link>
                    <Link href={`/admin/products/${p.id}`} className="text-xs font-semibold text-brand-600 hover:underline">
                      Edit
                    </Link>
                    {!p.isBundle && (
                      <Link
                        href={`/admin/products/new?packOf=${p.id}&qty=3`}
                        className="text-xs text-brand-600 hover:underline"
                      >
                        Create pack
                      </Link>
                    )}
                    <form action={deleteProductAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="text-xs text-red-600 hover:underline">Delete</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && <p className="p-10 text-center text-sm text-ink/50">No products yet.</p>}
      </div>
    </>
  );
}
