import type { ReactNode } from "react";
import type { IconType } from "react-icons";

export type EmptyStateProps = {
  title: string;
  description?: ReactNode;
  icon?: IconType;
  /** Buttons or links, such as "add the first item". */
  action?: ReactNode;
  /** `dashed` reads as "nothing here yet"; `card` sits among other cards. */
  variant?: "dashed" | "card";
  /** Heading level, so it fits the page outline. */
  headingLevel?: "h2" | "h3";
  className?: string;
};

/** The "nothing here yet" panel for empty lists. */
export default function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  variant = "dashed",
  headingLevel: Heading = "h2",
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-3xl bg-card p-10 text-center sm:p-12 ${
        variant === "dashed" ? "border border-dashed border-border" : "surface-card"
      } ${className}`}
    >
      {Icon && (
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-secondary-soft text-brand-secondary dark:text-brand-accent">
          <Icon className="size-7" aria-hidden="true" />
        </span>
      )}
      <Heading className={`${Icon ? "mt-5" : ""} text-lg font-black text-foreground sm:text-xl`}>{title}</Heading>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}
