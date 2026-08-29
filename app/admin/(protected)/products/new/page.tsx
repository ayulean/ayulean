import type { Metadata } from "next";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Naya product", robots: { index: false } };

export default function NewProductPage() {
  return (
    <>
      <h1 className="font-display text-2xl font-bold text-brand-900">Add a new product</h1>
      <p className="mt-1 text-sm text-ink/55">The product goes live on the website as soon as you save it.</p>
      <ProductForm />
    </>
  );
}
