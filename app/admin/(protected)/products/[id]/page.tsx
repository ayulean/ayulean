import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { getProductById } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Edit product", robots: { index: false } };

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const product = await getProductById(Number(id));
  if (!product) notFound();

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-brand-900">Edit {product.name}</h1>
      <p className="mt-1 text-sm text-ink/55">/{product.slug}</p>
      <ProductForm product={product} />
    </>
  );
}
