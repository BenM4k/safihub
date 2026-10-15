export function SettlementsLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Chargement des règlements">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-64 bg-slate-200 rounded-lg" />
        <div className="h-4 w-96 bg-slate-100 rounded-lg" />
      </div>

      {/* Period bar skeleton */}
      <div className="h-14 bg-slate-100 rounded-xl border border-border-strong" />

      {/* KPI Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="h-28 bg-slate-100 rounded-xl border-2 border-border-strong p-4" />
        <div className="h-28 bg-slate-100 rounded-xl border-2 border-border-strong p-4" />
      </div>

      {/* Table 1 skeleton */}
      <div className="space-y-3">
        <div className="h-5 w-36 bg-slate-200 rounded" />
        <div className="h-64 bg-slate-100 rounded-xl border-2 border-border-strong" />
      </div>

      {/* Table 2 skeleton */}
      <div className="space-y-3 pt-2">
        <div className="h-5 w-36 bg-slate-200 rounded" />
        <div className="h-64 bg-slate-100 rounded-xl border-2 border-border-strong" />
      </div>
    </div>
  );
}
