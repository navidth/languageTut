import type { CSSProperties, ReactNode } from "react";

type RingTone = "accent" | "success" | "warning" | "danger";

export type ProgressRingProps = {
  /** 0 to 100; `null` draws an empty ring. */
  value: number | null;
  /** Read by screen readers, e.g. "درصد: ۷۵٪". */
  label: string;
  /** Large text in the middle, e.g. the formatted percentage. */
  children?: ReactNode;
  /** Small text under the middle text. */
  caption?: ReactNode;
  tone?: RingTone;
  /** Size classes for the ring, e.g. "size-36". */
  className?: string;
  /** Stroke width in viewBox units (the box is 120 wide). */
  thickness?: number;
};

const toneColors: Record<RingTone, string> = {
  accent: "var(--brand-accent)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--destructive)",
};

/**
 * A circular progress or score display (Flowbite's Progress is a bar). The
 * arc fills from zero when it first appears; `ring-fill` in globals.css.
 */
export default function ProgressRing({
  value,
  label,
  children,
  caption,
  tone = "accent",
  className = "size-36",
  thickness = 10,
}: ProgressRingProps) {
  const radius = 60 - thickness / 2 - 1;
  const circumference = 2 * Math.PI * radius;
  const clamped = value === null ? 0 : Math.min(100, Math.max(0, value));
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className={`relative ${className}`} role="img" aria-label={label}>
      <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--border)" strokeWidth={thickness} />
        {value !== null && clamped > 0 && (
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={toneColors[tone]}
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="ring-fill transition-[stroke-dashoffset] duration-700 ease-out"
            style={{ "--ring-circumference": circumference } as CSSProperties}
          />
        )}
      </svg>
      {(children || caption) && (
        <div className="absolute inset-0 grid place-items-center text-center" aria-hidden="true">
          <div>
            {children && <p className="text-2xl font-black text-foreground">{children}</p>}
            {caption && <p className="text-xs text-muted-foreground">{caption}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
