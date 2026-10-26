import { Skeleton } from "@/components/ui/skeleton";

interface AdminOrderDetailSkeletonProps {
  label?: string;
}

export function AdminOrderDetailSkeleton({ label }: AdminOrderDetailSkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      className="flex flex-col gap-6 font-sans"
    >
      {label && <span className="sr-only">{label}</span>}
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-32 rounded" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-7 w-44 rounded-lg" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-3.5 w-48 rounded" />
        </div>
        <Skeleton className="h-9 w-36 rounded-lg border border-border" />
      </div>

      {/* 3 Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-border bg-card shadow-2xs flex flex-col gap-2.5"
          >
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-5 w-32 rounded" />
            <Skeleton className="h-3.5 w-full rounded" />
            <Skeleton className="h-3.5 w-4/5 rounded" />
          </div>
        ))}
      </div>

      {/* Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-card border border-border flex flex-col gap-4 shadow-2xs">
          <Skeleton className="h-5 w-40 rounded" />
          <div className="flex flex-col gap-2.5">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 p-5 rounded-2xl bg-card border border-border flex flex-col gap-4 shadow-2xs">
          <Skeleton className="h-5 w-32 rounded" />
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

