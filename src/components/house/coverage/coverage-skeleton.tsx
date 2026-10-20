export function CoverageSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-surface rounded-lg" />
          <div className="h-4 w-72 bg-surface rounded-lg" />
        </div>
        <div className="h-8 w-36 bg-surface rounded-xl" />
      </div>

      {/* Info card skeleton */}
      <div className="p-5 bg-card rounded-2xl border border-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 bg-surface rounded-xl" />
            <div className="space-y-1.5">
              <div className="h-4 w-44 bg-surface rounded" />
              <div className="h-3 w-32 bg-surface rounded" />
            </div>
          </div>
          <div className="h-7 w-32 bg-surface rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="h-16 bg-surface rounded-xl" />
          <div className="h-16 bg-surface rounded-xl" />
          <div className="h-16 bg-surface rounded-xl" />
        </div>
      </div>

      {/* Filter bar skeleton */}
      <div className="h-14 bg-card rounded-2xl border border-border" />

      {/* Group cards skeleton */}
      <div className="space-y-4">
        <div className="bg-card rounded-2xl border border-border h-48" />
        <div className="bg-card rounded-2xl border border-border h-48" />
      </div>
    </div>
  );
}
