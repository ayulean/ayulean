import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { getProductById, getProducts } from "@/lib/queries";

export const metadata: Metadata = { title: "Edit product", robots: { index: false } };

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const [product, products] = await Promise.all([
    getProductById(Number(id)),
    getProducts({ includeInactive: true }),
  ]);
  if (!product) notFound();

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-brand-900">Edit {product.name}</h1>
      <p className="mt-1 text-sm text-ink/55">
        /{product.slug}
        {product.isBundle && " · combo"}
      </p>
      <ProductForm
        product={product}
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
