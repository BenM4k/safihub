import { Skeleton } from "@/components/ui/skeleton";

interface DashboardSkeletonProps {
  label?: string;
}

export function DashboardSkeleton({ label }: DashboardSkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      className="flex flex-col gap-6 pb-12 font-sans"
    >
      {label && <span className="sr-only">{label}</span>}
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-7 w-52 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded" />
        </div>
        <Skeleton className="h-10 w-44 rounded-xl" />
      </div>

      {/* 2. Urgent Attention Alert */}
      <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-48 rounded bg-amber-500/20" />
          <Skeleton className="h-6 w-20 rounded-full bg-amber-500/20" />
        </div>
        <Skeleton className="h-4 w-3/4 rounded bg-amber-500/15" />
      </div>

      {/* 3. 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-card border border-border flex flex-col gap-3 shadow-2xs"
          >
            <div className="flex justify-between items-center">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="size-8 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-28 rounded-lg" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
        ))}
      </div>

      {/* 4. Live Operations: Orders + Fleet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-card border border-border flex flex-col gap-4 shadow-2xs">
          <Skeleton className="h-5 w-40 rounded" />
          <div className="flex flex-col gap-2.5">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 p-5 rounded-2xl bg-card border border-border flex flex-col gap-4 shadow-2xs">
          <Skeleton className="h-5 w-32 rounded" />
          <div className="flex flex-col gap-2.5">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

