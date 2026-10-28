import type { CSSProperties, ReactNode } from "react";

type LoaderSize = "sm" | "md" | "lg";

const dotSizes: Record<LoaderSize, string> = {
  sm: "size-1.5",
  md: "size-2",
  lg: "size-2.5",
};

export type PulseLoaderProps = {
  /** Read by screen readers in place of the dots. */
  label?: string;
  size?: LoaderSize;
  className?: string;
};

/**
 * Three dots that swell in turn, from the start side, in the current text
 * colour (Flowbite's Spinner is a ring only). The keyframes are `pulse-dot`
 * in globals.css; with reduced motion the dots stay still.
 */
export default function PulseLoader({
  label = "در حال بارگذاری",
  size = "md",
  className = "",
}: PulseLoaderProps) {
  return (
    <span role="status" className={`inline-flex items-center gap-1 ${className}`}>
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          aria-hidden="true"
          className={`pulse-dot rounded-full bg-current ${dotSizes[size]}`}
          style={{ "--pulse-delay": `${dot * 0.16}s` } as CSSProperties}
        />
      ))}
      <span className="sr-only">{label}</span>
    </span>
  );
}

export type LoadingContentProps = {
  loading: boolean;
  /** What the dots stand for, for screen readers. */
  label?: string;
  size?: LoaderSize;
  children: ReactNode;
};

/**
 * Swaps a button's content for the dots while `loading`, keeping the content
 * in place but invisible, so the button keeps its width and height.
 */
export function LoadingContent({ loading, label, size = "md", children }: LoadingContentProps) {
  if (!loading) return <>{children}</>;
  return (
    <span className="inline-grid place-items-center">
      <span className="invisible col-start-1 row-start-1 inline-flex items-center gap-2">{children}</span>
      <PulseLoader label={label} size={size} className="col-start-1 row-start-1" />
    </span>
  );
}
