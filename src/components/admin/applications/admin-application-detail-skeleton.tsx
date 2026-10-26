import { Skeleton } from "@/components/ui/skeleton";

interface AdminApplicationDetailSkeletonProps {
  label?: string;
}

export function AdminApplicationDetailSkeleton({ label }: AdminApplicationDetailSkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      className="flex flex-col gap-6 max-w-4xl font-sans"
    >
      {label && <span className="sr-only">{label}</span>}
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton className="size-8 rounded-lg" />
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-3 w-32 rounded" />
        </div>
      </div>

      {/* 2-column Grid: Applicant & Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Applicant Card */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-2xs flex flex-col gap-4">
          <Skeleton className="h-4 w-28 rounded" />
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3 w-12 rounded" />
              <Skeleton className="h-4 w-36 rounded" />
            </div>
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-4 w-32 rounded" />
            </div>
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3 w-12 rounded" />
              <Skeleton className="h-4 w-40 rounded" />
            </div>
          </div>
        </div>

        {/* Location Card */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-2xs flex flex-col gap-4">
          <Skeleton className="h-4 w-28 rounded" />
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-4 w-36 rounded" />
            </div>
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3 w-28 rounded" />
              <Skeleton className="h-4 w-48 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Facilities & Infrastructure Card */}
      <div className="bg-card rounded-xl border border-border p-5 shadow-2xs flex flex-col gap-4">
        <Skeleton className="h-4 w-32 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 bg-muted/30 rounded-lg flex flex-col gap-2">
            <Skeleton className="h-3 w-28 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
          <div className="p-3 bg-muted/30 rounded-lg flex flex-col gap-2">
            <Skeleton className="h-3 w-28 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
        </div>
      </div>

      {/* Review Section Skeleton */}
      <div className="bg-card rounded-xl border border-border p-5 shadow-2xs flex flex-col gap-4">
        <Skeleton className="h-4 w-36 rounded" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-9 w-full rounded-md" />
          <Skeleton className="h-20 w-full rounded-md" />
          <div className="flex justify-end gap-3 pt-2">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

