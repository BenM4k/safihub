import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

interface SettlementsLoadingSkeletonProps {
  label?: string;
}

export function SettlementsLoadingSkeleton({ label }: SettlementsLoadingSkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      className="flex flex-col gap-6 font-sans"
    >
      {label && <span className="sr-only">{label}</span>}
      {/* Header skeleton */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-64 rounded-lg" />
        <Skeleton className="h-4 w-96 rounded-lg" />
      </div>

      {/* Period bar skeleton */}
      <Skeleton className="h-14 w-full rounded-xl border border-border" />

      {/* KPI row skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center py-1">
        {[1, 2].map((i) => (
          <div key={i} className="flex-1 p-3 space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-28 rounded" />
              <Skeleton className="size-3.5 rounded" />
            </div>
            <Skeleton className="h-8 w-36 rounded" />
            <Skeleton className="h-3 w-32 rounded" />
          </div>
        ))}
      </div>

      <Separator />

      {/* Table 1 skeleton */}
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-36 rounded" />
        <Skeleton className="h-64 w-full rounded-xl border border-border" />
      </div>

      {/* Table 2 skeleton */}
      <div className="flex flex-col gap-3 pt-2">
        <Skeleton className="h-5 w-36 rounded" />
        <Skeleton className="h-64 w-full rounded-xl border border-border" />
      </div>
    </div>
  );
}
