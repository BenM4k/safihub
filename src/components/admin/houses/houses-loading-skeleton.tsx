import { Skeleton } from "@/components/ui/skeleton";

interface HousesLoadingSkeletonProps {
  label?: string;
}

export function HousesLoadingSkeleton({ label }: HousesLoadingSkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      className="flex flex-col gap-6 font-sans"
    >
      {label && <span className="sr-only">{label}</span>}
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-border">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-48 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded-md" />
          <div className="flex items-center gap-2 pt-2">
            <Skeleton className="h-6 w-24 rounded-xl" />
            <Skeleton className="h-6 w-20 rounded-xl" />
          </div>
        </div>
        <Skeleton className="h-10 w-44 rounded-xl" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between gap-4">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>

        <div className="p-4 flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-14 w-full bg-muted/20 rounded-xl flex items-center px-4 justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-lg shrink-0" />
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-3 w-20 rounded" />
                </div>
              </div>
              <Skeleton className="h-4 w-20 rounded hidden sm:block" />
              <Skeleton className="h-4 w-24 rounded hidden md:block" />
              <Skeleton className="h-6 w-16 rounded-md" />
              <Skeleton className="h-4 w-20 rounded text-right" />
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

