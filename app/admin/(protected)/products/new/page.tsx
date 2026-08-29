import type { Metadata } from "next";
import ProductForm from "@/components/admin/ProductForm";
import { getProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Add a new product", robots: { index: false } };

export default async function NewProductPage() {
  const products = await getProducts({ includeInactive: true });

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-brand-900">Add a new product</h1>
      <p className="mt-1 text-sm text-ink/55">
        The product goes live on the website as soon as you save it. To sell a combo, add the products it
        contains under &ldquo;Combo contents&rdquo;.
      </p>
      <ProductForm
        allProducts={products.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          stock: p.stock,
          isBundle: p.isBundle,
        }))}
      />
    </>
  );
}
