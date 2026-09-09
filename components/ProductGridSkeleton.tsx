/** Placeholder cards, shown while a product grid is still on its way. */
export default function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
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
  );
}
