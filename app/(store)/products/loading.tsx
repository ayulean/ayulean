import ProductGridSkeleton from "@/components/ProductGridSkeleton";

/** Shown while the shop page fetches products — same grid, shimmering. */
export default function ProductsLoading() {
  return (
    <div className="container-x py-10 lg:py-14">
      <div className="skeleton h-9 w-48 rounded-lg" />
      <div className="skeleton mt-3 h-5 w-72 rounded-lg" />
      <ProductGridSkeleton />
    </div>
  );
}
