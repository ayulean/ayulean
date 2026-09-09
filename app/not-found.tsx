import Link from "next/link";
import Icon from "@/components/Icon";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <p className="font-display text-[5rem] font-bold leading-none text-brand-100">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-brand-900">
        This page could not be found
      </h1>
      <p className="mt-2 max-w-sm text-ink/55">
        The link may be out of date, or the address may have been mistyped.
      </p>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="btn btn-primary btn-lg">
          <Icon name="home" size={17} />
          Go to home
        </Link>
        <Link href="/products" className="btn btn-secondary btn-lg">
          Browse the shop
        </Link>
      </div>
    </div>
  );
}
