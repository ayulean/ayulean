/** Mirrors the product page's two-column layout while the product loads. */
export default function ProductDetailSkeleton() {
  return (
    <div className="container-x py-10 lg:py-14">
      <div className="skeleton h-4 w-56 rounded" />

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <div className="skeleton aspect-square rounded-3xl" />
          <div className="mt-4 flex gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-20 w-20 rounded-xl" />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="skeleton h-10 w-4/5 rounded-lg" />
          <div className="skeleton h-6 w-full rounded" />
          <div className="skeleton h-5 w-40 rounded" />
          <div className="skeleton h-12 w-56 rounded-lg" />
          <div className="skeleton h-11 w-44 rounded-full" />
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <div className="skeleton h-14 flex-1 rounded-full" />
            <div className="skeleton h-14 flex-1 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
