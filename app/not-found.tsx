import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-6xl font-bold text-brand-200">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-brand-900">This page could not be found</h1>
      <p className="mt-2 text-ink/60">The link may be out of date, or the address may have been mistyped.</p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="rounded-full bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700">
          Go to home
        </Link>
        <Link href="/products" className="rounded-full border border-brand-300 px-6 py-3 font-semibold text-brand-700 hover:bg-brand-50">
          Browse the shop
        </Link>
      </div>
    </div>
  );
}
