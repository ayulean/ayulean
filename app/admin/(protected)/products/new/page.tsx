import type { Metadata } from "next";
import ProductForm, { type ProductDraft } from "@/components/admin/ProductForm";
import { getProductById, getProducts } from "@/lib/queries";

export const metadata: Metadata = { title: "Add a new product", robots: { index: false } };

export default async function NewProductPage({ searchParams }: PageProps<"/admin/products/new">) {
  const sp = await searchParams;
  const packOf = Number(typeof sp.packOf === "string" ? sp.packOf : 0);
  const qty = Math.min(50, Math.max(2, Number(typeof sp.qty === "string" ? sp.qty : 3) || 3));

  const products = await getProducts({ includeInactive: true });
  const base = packOf ? await getProductById(packOf) : null;

  // Creating a pack of an existing product: carry over its look and suggest a
  // price. The MRP defaults to the honest "bought separately" figure so the
  // saving shown to customers is real.
  const draft: ProductDraft | undefined =
    base && !base.isBundle
      ? {
          name: `${base.name} — Pack of ${qty}`,
          subtitle: base.subtitle,
          description: base.description,
          image: base.image,
          gallery: base.gallery,
          mrp: base.price * qty,
          price: base.price * qty,
          bundleItems: [{ productId: base.id, qty }],
        }
      : undefined;

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-brand-900">
        {draft ? `Create a pack of ${base?.name}` : "Add a new product"}
      </h1>
      <p className="mt-1 text-sm text-ink/55">
        {draft
          ? `Prefilled as ${qty} × ${base?.name}. Lower the price below to give customers a reason to buy the pack.`
          : "The product goes live on the website as soon as you save it. To sell a combo or a multipack, use \u201cCombo contents\u201d."}
      </p>
      <ProductForm
        draft={draft}
        allProducts={products.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          stock: p.stock,
          isBundle: p.isBundle,
          active: p.active,
        }))}
      />
    </>
  );
}
