import { Skeleton } from "@/components/ui/skeleton";

interface AdminApplicationsSkeletonProps {
  label?: string;
}

export function AdminApplicationsSkeleton({ label }: AdminApplicationsSkeletonProps) {
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
        <Skeleton className="h-7 w-64 rounded-lg" />
        <Skeleton className="h-4 w-80 rounded" />
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Skeleton className="h-7 w-20 rounded-lg" />
        <Skeleton className="h-7 w-24 rounded-lg" />
        <Skeleton className="h-7 w-20 rounded-lg" />
        <Skeleton className="h-7 w-20 rounded-lg" />
      </div>

      {/* Applications Table Card */}
      <div className="bg-card rounded-xl border border-border shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <Skeleton className="h-4 w-36 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
        <div className="h-10 bg-muted/40 border-b border-border flex items-center px-4" />
        <div className="divide-y divide-border">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 px-4 flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1.5 w-44">
                <Skeleton className="h-4 w-36 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>
              <div className="flex flex-col gap-1.5 w-36">
                <Skeleton className="h-3 w-28 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
              <div className="flex flex-col gap-1.5 w-36">
                <Skeleton className="h-3 w-28 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

