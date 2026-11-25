export function DashboardMetricsSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading metrics">
      {/* Alert card skeleton */}
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-xl animate-shimmer shrink-0" />
            <div className="space-y-2">
              <div className="h-3 w-28 rounded animate-shimmer" />
              <div className="h-5 w-52 rounded animate-shimmer" />
              <div className="h-3.5 w-72 max-w-full rounded animate-shimmer" />
            </div>
          </div>
          <div className="h-10 w-44 rounded-lg animate-shimmer shrink-0" />
        </div>
      </div>

      {/* Stat chips skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="h-14 rounded-lg border border-border bg-card animate-shimmer"
          />
        ))}
      </div>

      {/* Overview KPI strip skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="h-24 rounded-xl border border-border bg-card p-4 space-y-3"
          >
            <div className="h-3 w-24 rounded animate-shimmer" />
            <div className="h-6 w-28 rounded animate-shimmer" />
          </div>
        ))}
      </div>

      {/* Scorecard skeleton */}
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-4 w-48 rounded animate-shimmer" />
            <div className="h-3 w-64 rounded animate-shimmer" />
          </div>
          <div className="h-6 w-36 rounded animate-shimmer" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-10 rounded-lg animate-shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardOperationsSkeleton() {
  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      aria-busy="true"
      aria-label="Loading live operations"
    >
      <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="h-4 w-40 rounded animate-shimmer" />
            <div className="h-3 w-56 rounded animate-shimmer" />
          </div>
          <div className="h-9 w-44 rounded-lg animate-shimmer" />
        </div>
        <div className="space-y-2.5">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="h-11 rounded-lg animate-shimmer" />
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 rounded animate-shimmer" />
          <div className="h-5 w-16 rounded-full animate-shimmer" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-16 rounded-lg animate-shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 pb-12">
      <DashboardMetricsSkeleton />
      <DashboardOperationsSkeleton />
    </div>
  );
}
