export function DispatchLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse font-sans">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-secondary rounded-lg" />
          <div className="h-4 w-96 bg-muted rounded-md" />
        </div>
      </div>

      {/* KPI Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-xl border border-border bg-card space-y-3">
            <div className="h-3 w-32 bg-secondary rounded" />
            <div className="h-8 w-16 bg-muted rounded" />
            <div className="h-3 w-40 bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* List skeleton */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <div className="h-10 w-full bg-muted rounded-lg" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 w-full bg-surface border border-border rounded-xl" />
        ))}
      </div>
    </div>
  );
}
