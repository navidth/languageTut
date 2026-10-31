import type { ReactNode } from "react";
import Link from "next/link";
import type { IconType } from "react-icons";
import { HiArrowLeft } from "react-icons/hi";

/** A titled dashboard card, with an optional "see all" link in its header. */
export default function DashboardSection({
  id,
  title,
  description,
  icon: Icon,
  action,
  children,
  className = "",
}: {
  /** Id of the heading, which labels the section. */
  id: string;
  title: string;
  description?: string;
  icon: IconType;
  action?: { href: string; label: string };
  children: ReactNode;
  className?: string;
}) {
  return (
    <section aria-labelledby={id} className={`surface-card rounded-3xl p-5 sm:p-6 ${className}`}>
      <header className="mb-5 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {/* Left out on phones and tablets, where the title needs the room. */}
          <span className="hidden size-10 shrink-0 place-items-center rounded-2xl bg-accent-soft text-brand-accent lg:grid">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 id={id} className="text-lg font-black leading-7">
              {title}
            </h2>
            {description && <p className="text-xs leading-5 text-muted-foreground">{description}</p>}
          </div>
        </div>
        {action && (
          <Link href={action.href} className="brand-link mt-2 inline-flex shrink-0 items-center gap-1 text-sm">
            {action.label}
            <HiArrowLeft className="size-4" aria-hidden="true" />
          </Link>
        )}
      </header>
      {children}
    </section>
  );
}
