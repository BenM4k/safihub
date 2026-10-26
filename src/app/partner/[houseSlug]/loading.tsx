import { Skeleton } from "@/components/ui/skeleton";

export default function PartnerLoading() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-busy="true"
      aria-label="Chargement du tableau de bord"
    >
      {/* Banner Skeleton */}
      <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-xs">
        <Skeleton className="h-36 sm:h-48 md:h-52 w-full rounded-none" />
        <div className="p-4 sm:p-6 pt-0 bg-card">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 sm:-mt-12">
            <div className="flex items-end gap-3.5 sm:gap-5">
              <Skeleton className="size-20 sm:size-24 rounded-2xl ring-4 ring-background shrink-0" />
              <div className="space-y-2 pb-1">
                <Skeleton className="h-6 w-44 rounded-lg" />
                <Skeleton className="h-4 w-32 rounded-lg" />
              </div>
            </div>
            <div className="flex items-center gap-2 pb-1">
              <Skeleton className="h-9 w-28 rounded-xl" />
              <Skeleton className="h-9 w-32 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-card border border-border shadow-2xs space-y-2.5"
          >
            <Skeleton className="h-3.5 w-20 rounded" />
            <Skeleton className="h-7 w-24 rounded-lg" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
        ))}
      </div>

      {/* Priority Queue Skeleton */}
      <div className="rounded-2xl bg-card border border-border p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-48 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-border bg-muted/40 flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-3 w-48 rounded" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-20 rounded-xl" />
                <Skeleton className="h-9 w-24 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
