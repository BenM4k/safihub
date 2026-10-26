import { Skeleton } from "@/components/ui/skeleton";

interface AdminCoverageSkeletonProps {
  label?: string;
}

export function AdminCoverageSkeleton({ label }: AdminCoverageSkeletonProps) {
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

      {/* Distance Limit Form Skeleton */}
      <div className="p-5 bg-card rounded-xl border border-border shadow-2xs flex flex-col gap-4">
        <Skeleton className="h-4 w-48 rounded" />
        <div className="flex flex-col sm:flex-row items-end gap-4 max-w-md">
          <div className="flex flex-col gap-1.5 w-full">
            <Skeleton className="h-3 w-36 rounded" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
          <Skeleton className="h-9 w-32 rounded-lg shrink-0" />
        </div>
      </div>

      {/* Neighborhood Status Table Skeleton */}
      <div className="bg-card rounded-xl border border-border shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <Skeleton className="h-4 w-40 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
        </div>
        <div className="h-10 bg-muted/40 border-b border-border flex items-center px-4" />
        <div className="divide-y divide-border">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 px-4 flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-36 rounded" />
              <Skeleton className="h-3 w-28 rounded" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Coverage Demand Table Skeleton */}
      <div className="bg-card rounded-xl border border-border shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <Skeleton className="h-4 w-44 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
        <div className="h-10 bg-muted/40 border-b border-border flex items-center px-4" />
        <div className="divide-y divide-border">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 px-4 flex items-center justify-between gap-4">
              <Skeleton className="h-3 w-36 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

