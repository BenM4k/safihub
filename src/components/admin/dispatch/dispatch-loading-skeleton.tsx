import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

interface DispatchLoadingSkeletonProps {
  label?: string;
}

export function DispatchLoadingSkeleton({ label }: DispatchLoadingSkeletonProps) {
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-64 rounded-lg" />
          <Skeleton className="h-4 w-96 rounded-md" />
        </div>
      </div>

      {/* KPI Cards skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center py-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="contents">
            {i > 1 && (
              <>
                <Separator orientation="vertical" className="hidden sm:block h-12 mx-4 shrink-0" />
                <Separator orientation="horizontal" className="sm:hidden my-2" />
              </>
            )}
            <div className="flex-1 p-3 space-y-2">
              <Skeleton className="h-3 w-32 rounded" />
              <Skeleton className="h-7 w-16 rounded" />
              <Skeleton className="h-3 w-40 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* List skeleton */}
      <div className="p-4 flex flex-col gap-4">
        <Skeleton className="h-10 w-full rounded-lg" />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}

