/** Shown while the shop page fetches products — same grid, shimmering. */
export default function ProductsLoading() {
  return (
    <div className="container-x py-10 lg:py-14">
      <div className="skeleton h-9 w-48 rounded-lg" />
      <div className="skeleton mt-3 h-5 w-72 rounded-lg" />

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-brand-100">
            <div className="skeleton aspect-square" />
            <div className="space-y-3 p-4">
              <div className="skeleton h-5 w-3/4 rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-1/3 rounded" />
              <div className="skeleton h-6 w-24 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
