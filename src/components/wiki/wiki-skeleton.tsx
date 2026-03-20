/**
 * Skeleton loader for wiki card grids
 * Shows animated placeholder cards during data loading
 */

interface WikiSkeletonProps {
  count?: number;
  variant?: "champion" | "region";
}

export function WikiSkeleton({ count = 12, variant = "champion" }: WikiSkeletonProps) {
  const aspectRatio = variant === "champion" ? "aspect-[3/4]" : "aspect-[4/3]";

  return (
    <div
      className={`grid gap-4 ${
        variant === "champion"
          ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      }`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${aspectRatio} animate-pulse rounded-lg bg-stone-800 border border-stone-700`}
        >
          <div className="h-full flex flex-col justify-end p-4">
            <div className="h-4 w-3/4 rounded bg-stone-700 mb-2" />
            <div className="h-3 w-1/2 rounded bg-stone-700" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Single card skeleton for detail pages
 */
export function WikiDetailSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Hero skeleton */}
      <div className="h-64 rounded-lg bg-stone-800" />

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-6 w-1/3 rounded bg-stone-700" />
          <div className="h-4 w-full rounded bg-stone-800" />
          <div className="h-4 w-5/6 rounded bg-stone-800" />
          <div className="h-4 w-4/6 rounded bg-stone-800" />
        </div>
        <div className="space-y-4">
          <div className="h-48 rounded-lg bg-stone-800" />
        </div>
      </div>
    </div>
  );
}
