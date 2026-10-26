import { Skeleton } from "@/components/ui/skeleton";

interface AdminNeighborhoodsSkeletonProps {
  label?: string;
}

export function AdminNeighborhoodsSkeleton({ label }: AdminNeighborhoodsSkeletonProps) {
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
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-7 w-64 rounded-lg" />
        <Skeleton className="h-4 w-80 rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Zones Card */}
        <div className="lg:col-span-1 bg-card p-5 rounded-xl border border-border shadow-2xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-lg" />
            ))}
          </div>
          <div className="pt-2 border-t border-border flex flex-col gap-3">
            <Skeleton className="h-3 w-24 rounded" />
            <Skeleton className="h-9 w-full rounded-md" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        </div>

        {/* Right: Neighborhoods Table & Add Form */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-card rounded-xl border border-border shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <Skeleton className="h-4 w-36 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
            <div className="h-10 bg-muted/40 border-b border-border flex items-center px-4" />
            <div className="divide-y divide-border">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 px-4 flex items-center justify-between gap-4">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-7 w-20 rounded-lg" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card p-5 rounded-xl border border-border shadow-2xs flex flex-col gap-4">
            <Skeleton className="h-4 w-40 rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <Skeleton className="h-9 w-28 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

