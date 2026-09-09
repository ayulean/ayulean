import type { Metadata } from "next";
import { Suspense } from "react";
import Icon from "@/components/Icon";
import ProductGrid from "@/components/ProductGrid";
import ProductGridSkeleton from "@/components/ProductGridSkeleton";
import { getProducts } from "@/lib/queries";
import { SITE } from "@/lib/site";

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

/**
 * The heading is the same on every visit, so it is prerendered and served
 * straight away. Only the part that depends on the query string — the search
 * box and the grid it filters — waits for the request.
 */
export default function ProductsPage({ searchParams }: PageProps<"/products">) {
  return (
    <div className="container-x py-12 lg:py-16">
      <header className="mx-auto max-w-xl text-center">
        <p className="eyebrow">Shop</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-brand-900">
          Every formula we make
        </h1>
        <p className="mt-3 text-ink/55">
          Each product is based on a classical Ayurvedic formulation — GMP certified and lab tested.
        </p>
      </header>

      <Suspense fallback={<ProductGridSkeleton />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Results({ searchParams }: Pick<PageProps<"/products">, "searchParams">) {
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
    <>
      <form
        method="get"
        role="search"
        className="mx-auto mt-8 flex max-w-2xl flex-col gap-2.5 sm:flex-row"
      >
        <div className="relative min-w-0 flex-1">
          <Icon
            name="search"
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35"
          />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search products, ingredients or benefits"
            aria-label="Search products"
            className="field pl-10"
          />
        </div>
        <select name="sort" defaultValue={sort} aria-label="Sort products" className="field sm:w-48 sm:shrink-0">
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary">
          Apply
        </button>
      </form>

      {q && (
        <p className="mt-6 text-center text-sm text-ink/55">
          {sorted.length} {sorted.length === 1 ? "result" : "results"} for “{q}”
        </p>
      )}

      {sorted.length === 0 ? (
        <div className="mt-14 flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted text-ink/30">
            <Icon name="search" size={24} />
          </span>
          <p className="mt-4 text-ink/55">
            {q ? "Nothing matched your search. Try a different word." : "No products are available right now."}
          </p>
        </div>
      ) : (
        <ProductGrid products={sorted} className="mt-10" />
      )}
    </>
  );
}
