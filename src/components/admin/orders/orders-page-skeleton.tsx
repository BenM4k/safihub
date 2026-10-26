import { Skeleton } from "@/components/ui/skeleton";

interface OrdersPageSkeletonProps {
  label?: string;
}

export function OrdersPageSkeleton({ label }: OrdersPageSkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      className="flex flex-col gap-6 font-sans"
    >
      {label && <span className="sr-only">{label}</span>}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-7 w-52 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded" />
        </div>
        <Skeleton className="h-10 w-44 rounded-xl" />
      </div>

      {/* Filter toolbar */}
      <div className="p-4 rounded-xl bg-card border border-border flex flex-col sm:flex-row justify-between gap-3 shadow-2xs">
        <Skeleton className="h-10 w-full sm:max-w-md rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
        <div className="h-11 bg-muted/40 border-b border-border flex items-center px-4" />
        <div className="divide-y divide-border">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-14 px-4 flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

