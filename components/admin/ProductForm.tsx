import Link from "next/link";
import BundleBuilder, { type BuilderProduct } from "@/components/admin/BundleBuilder";
import ImageUploader from "@/components/admin/ImageUploader";
import { saveProductAction } from "@/lib/actions";
import type { Product } from "@/lib/types";

const field =
  "mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

export function ProductForm({
  product,
  allProducts,
}: {
  product?: Product;
  allProducts: BuilderProduct[];
}) {
  return (
    <form action={saveProductAction} className="mt-6 max-w-3xl space-y-6">
      {product && <input type="hidden" name="id" value={product.id} />}

      <section className="rounded-2xl border border-brand-100 bg-white p-6">
        <h2 className="font-display text-lg font-bold text-brand-800">Basic details</h2>

        <label className="mt-4 block text-sm font-medium">
          Product name *
          <input name="name" required defaultValue={product?.name} className={field} />
        </label>

        <label className="mt-4 block text-sm font-medium">
          URL slug (leave blank to generate it from the name)
          <input name="slug" defaultValue={product?.slug} placeholder="ayurvedic-supplement" className={field} />
        </label>

        <label className="mt-4 block text-sm font-medium">
          Short subtitle
          <input name="subtitle" defaultValue={product?.subtitle} className={field} />
        </label>

        <label className="mt-4 block text-sm font-medium">
          Description (press Enter twice to start a new paragraph)
          <textarea name="description" rows={7} defaultValue={product?.description} className={field} />
        </label>
      </section>

      <BundleBuilder products={allProducts} initial={product?.bundle_items ?? []} editingId={product?.id} />

      <section className="rounded-2xl border border-brand-100 bg-white p-6">
        <h2 className="font-display text-lg font-bold text-brand-800">Price &amp; stock</h2>
        <p className="mt-1 text-xs text-ink/50">The discount percentage is calculated automatically from the MRP and the selling price.</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="text-sm font-medium">
            MRP (₹) *
            <input name="mrp" type="number" min={0} required defaultValue={product?.mrp ?? 0} className={field} />
          </label>
          <label className="text-sm font-medium">
            Selling price (₹) *
            <input name="price" type="number" min={0} required defaultValue={product?.price ?? 0} className={field} />
          </label>
          <label className="text-sm font-medium">
            Stock (pieces) *
            <input name="stock" type="number" min={0} required defaultValue={product?.stock ?? 100} className={field} />
            <span className="mt-1 block text-[11px] leading-snug text-ink/50">
              Ignored for a combo — its availability comes from the products inside it.
            </span>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-brand-100 bg-white p-6">
        <h2 className="font-display text-lg font-bold text-brand-800">Images</h2>
        <p className="mt-1 text-xs text-ink/50">
          Upload photos below and the fields fill in automatically. You can also paste a path from{" "}
          <code className="rounded bg-brand-50 px-1">public/img/</code>, for example{" "}
          <code className="rounded bg-brand-50 px-1">/img/product-1.svg</code>.
        </p>

        <ImageUploader mainInputId="product-image" galleryInputId="product-gallery" />

        <label className="mt-4 block text-sm font-medium">
          Main image
          <input id="product-image" name="image" defaultValue={product?.image ?? "/img/product-1.svg"} className={field} />
        </label>

        <label className="mt-4 block text-sm font-medium">
          Gallery (one image path per line)
          <textarea
            id="product-gallery"
            name="gallery"
            rows={4}
            defaultValue={(product?.gallery ?? ["/img/product-1.svg"]).join("\n")}
            className={field}
          />
        </label>
      </section>

      <section className="rounded-2xl border border-brand-100 bg-white p-6">
        <h2 className="font-display text-lg font-bold text-brand-800">Additional details</h2>

        <label className="mt-4 block text-sm font-medium">
          Key benefits (one point per line)
          <textarea name="benefits" rows={6} defaultValue={(product?.benefits ?? []).join("\n")} className={field} />
        </label>

        <label className="mt-4 block text-sm font-medium">
          Ingredients
          <textarea name="ingredients" rows={3} defaultValue={product?.ingredients} className={field} />
        </label>

        <label className="mt-4 block text-sm font-medium">
          How to use
          <textarea name="how_to_use" rows={3} defaultValue={product?.how_to_use} className={field} />
        </label>

        <label className="mt-5 flex items-center gap-2.5 text-sm font-medium">
          <input type="checkbox" name="active" defaultChecked={product ? product.active : true} className="h-4 w-4" />
          Show live on the website
        </label>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="rounded-full bg-brand-600 px-8 py-3 font-semibold text-white hover:bg-brand-700"
        >
          {product ? "Save changes" : "Add product"}
        </button>
        <Link
          href="/admin/products"
          className="rounded-full border border-brand-300 px-8 py-3 font-semibold text-brand-700 hover:bg-brand-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

export default ProductForm;
