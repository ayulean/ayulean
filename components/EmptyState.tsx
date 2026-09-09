import Link from "next/link";
import Icon, { type IconName } from "./Icon";

/** The shared "nothing here yet" panel used by the cart, wishlist and search. */
export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon: IconName;
  title: string;
  text?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="container-x flex flex-col items-center py-20 text-center sm:py-24">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted text-brand-400">
        <Icon name={icon} size={28} />
      </span>
      <h1 className="mt-5 font-display text-2xl font-bold tracking-tight text-brand-900 sm:text-3xl">
        {title}
      </h1>
      {text && <p className="mt-2 max-w-sm text-ink/55">{text}</p>}
      {action && (
        <Link href={action.href} className="btn btn-primary btn-lg mt-7">
          {action.label}
          <Icon name="arrow-right" size={17} />
        </Link>
      )}
    </div>
  );
}

export default EmptyState;
