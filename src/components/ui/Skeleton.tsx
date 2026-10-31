type SkeletonProps = {
  className?: string;
};

/** A single pulsing placeholder block. */
export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-secondary-soft ${className}`}
    />
  );
}

/** Placeholder with the proportions of a dashboard list card. */
function SkeletonCard({ className = "" }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-2xl border border-border bg-card p-5 ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-6 w-28 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="mt-5 h-6 w-3/4" />
      <Skeleton className="mt-4 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-5/6" />
      <Skeleton className="mt-2 h-4 w-1/2" />
      <Skeleton className="mt-6 h-10 w-36 rounded-xl" />
    </div>
  );
}

type SkeletonGridProps = {
  /** Announced to assistive technology while the content loads. */
  label: string;
  count?: number;
  className?: string;
};

export function SkeletonGrid({
  label,
  count = 6,
  className = "grid gap-4 md:grid-cols-2 xl:grid-cols-3",
}: SkeletonGridProps) {
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}
