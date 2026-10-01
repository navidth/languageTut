import type { ReactNode } from "react";
import type { StatusTone } from "@/types";

const toneClasses: Record<StatusTone, string> = {
  neutral: "bg-muted text-muted-foreground",
  info: "bg-secondary-soft text-brand-secondary dark:text-white",
  warning: "bg-accent-soft text-warning",
  danger: "bg-destructive-soft text-destructive",
  success: "bg-success-soft text-success",
};

/** Plain text colour for a tone, for hints that are not badges. */
export const toneTextClasses: Record<StatusTone, string> = {
  neutral: "text-muted-foreground",
  info: "text-brand-secondary dark:text-white",
  warning: "text-warning",
  danger: "text-destructive",
  success: "text-success",
};

type StatusBadgeProps = {
  tone?: StatusTone;
  children: ReactNode;
  className?: string;
};

export default function StatusBadge({
  tone = "neutral",
  children,
  className = "",
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
