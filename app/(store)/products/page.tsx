import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/queries";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop",
  description: `All ${SITE.name} Ayurvedic products — with Cash on Delivery, online payment and ${SITE.replacementDays}-day replacement.`,
};

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
  { value: "discount", label: "Biggest discount" },
];

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const sp = await searchParams;
  const q = (typeof sp.q === "string" ? sp.q : "").trim();
  const sort = typeof sp.sort === "string" ? sp.sort : "featured";

  let products = await getProducts();

  if (q) {
    const needle = q.toLowerCase();
    products = products.filter((p) =>
      [p.name, p.subtitle, p.description, p.ingredients, ...p.benefits].join(" ").toLowerCase().includes(needle)
    );
  }

  const sorted = [...products];
  if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
  else if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
  else if (sort === "discount") sorted.sort((a, b) => b.discountPercent - a.discountPercent);

  return (
    <div className="container-x py-12 lg:py-16">
      <header className="text-center">
        <h1 className="font-display text-4xl font-bold text-brand-900">Shop</h1>
        <p className="mx-auto mt-3 max-w-xl text-ink/60">
          Every product is based on a classical Ayurvedic formulation — GMP certified and lab tested.
        </p>
      </header>

      <form method="get" className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search products, ingredients or benefits"
          aria-label="Search products"
          className="flex-1 rounded-full border border-brand-200 px-5 py-3 text-sm focus:border-brand-500 focus:outline-none"
        />
        <select
          name="sort"
          defaultValue={sort}
          aria-label="Sort products"
          className="rounded-full border border-brand-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-full bg-brand-600 px-7 py-3 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Apply
        </button>
      </form>

      {q && (
        <p className="mt-6 text-center text-sm text-ink/60">
          {sorted.length} {sorted.length === 1 ? "result" : "results"} for “{q}”
        </p>
      )}

      {sorted.length === 0 ? (
        <p className="mt-16 text-center text-ink/60">
          {q ? "Nothing matched your search. Try a different word." : "No products are available right now."}
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sorted.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
