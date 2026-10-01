import type { ReactNode } from "react";
import Link from "next/link";

type PageMessageProps = {
  text: string;
  title?: string;
  retry?: () => void;
  backHref?: string;
  backLabel?: string;
  /** Extra actions shown between the retry button and the back link. */
  children?: ReactNode;
};

/** Full-page notice for empty, missing, forbidden and failed detail views. */
export default function PageMessage({
  text,
  title,
  retry,
  backHref,
  backLabel = "بازگشت",
  children,
}: PageMessageProps) {
  const hasActions = Boolean(retry || backHref || children);

  return (
    <div
      className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-10 text-center"
      role={retry ? "alert" : "status"}
    >
      {title && <h1 className="mb-3 text-2xl font-black">{title}</h1>}
      <p className="leading-8 text-muted-foreground">{text}</p>
      {hasActions && (
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {retry && (
            <button
              type="button"
              onClick={retry}
              className="brand-button rounded-xl px-5 py-2"
            >
              تلاش دوباره
            </button>
          )}
          {children}
          {backHref && (
            <Link href={backHref} className="ghost-button rounded-xl px-5 py-2">
              {backLabel}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
