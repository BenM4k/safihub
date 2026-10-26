import { Skeleton } from "@/components/ui/skeleton";

interface AdminCouriersSkeletonProps {
  label?: string;
}

export function AdminCouriersSkeleton({ label }: AdminCouriersSkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      className="flex flex-col gap-6 font-sans"
    >
      {label && <span className="sr-only">{label}</span>}
      {/* Page Header */}
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-7 w-56 rounded-lg" />
        <Skeleton className="h-4 w-72 rounded" />
      </div>

      {/* Courier Create Form Skeleton */}
      <div className="p-5 bg-card rounded-xl border border-border shadow-2xs flex flex-col gap-4">
        <Skeleton className="h-4 w-36 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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

      {/* Couriers Table Skeleton */}
      <div className="bg-card rounded-xl border border-border shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <Skeleton className="h-4 w-36 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
        <div className="h-10 bg-muted/40 border-b border-border flex items-center px-4" />
        <div className="divide-y divide-border">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 px-4 flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-3 w-32 rounded" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-14 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

