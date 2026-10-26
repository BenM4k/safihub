import { Skeleton } from "@/components/ui/skeleton";

interface AdminDeliveryFeesSkeletonProps {
  label?: string;
}

export function AdminDeliveryFeesSkeleton({ label }: AdminDeliveryFeesSkeletonProps) {
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

      {/* Fee Pair Form Skeleton */}
      <div className="p-5 bg-card rounded-xl border border-border shadow-2xs flex flex-col gap-4">
        <Skeleton className="h-4 w-44 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-1">
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Fee Matrix Table Skeleton */}
      <div className="bg-card rounded-xl border border-border shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <Skeleton className="h-4 w-40 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
        <div className="h-10 bg-muted/40 border-b border-border flex items-center px-4" />
        <div className="divide-y divide-border">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-14 px-4 flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

