import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

interface CashLoadingSkeletonProps {
  label?: string;
}

export function CashLoadingSkeleton({ label }: CashLoadingSkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      className="flex flex-col gap-6 font-sans"
    >
      {label && <span className="sr-only">{label}</span>}
      {/* 1. Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-80 rounded-lg" />
          <Skeleton className="h-4 w-96 max-w-full rounded-md" />
        </div>
        <Skeleton className="h-10 w-64 rounded-xl" />
      </div>

      {/* 2. KPI row skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center py-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 p-3 space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="size-3.5 rounded" />
            </div>
            <Skeleton className="h-8 w-36 rounded" />
            <Skeleton className="h-3 w-28 rounded" />
          </div>
        ))}
      </div>

      <Separator />

      {/* 3. Section Heading & Couriers Table skeleton */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-48 rounded" />
          <Skeleton className="h-4 w-36 rounded" />
        </div>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="h-10 bg-muted/40 border-b border-border" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border-b border-border/60 flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* 4. History Table skeleton */}
      <div className="flex flex-col gap-3 pt-2">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <Skeleton className="h-5 w-52 rounded" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
          <div className="h-12 bg-muted/30 border-b border-border" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3.5 border-b border-border/60 flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
