/**
 * Skeleton placeholder matching the courier history page (/courier/history).
 */
export function CourierHistorySkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement de l'historique des courses"
      className="space-y-4 pb-20 animate-pulse"
    >
      {/* Earnings Summary Banner */}
      <div className="p-5 bg-brand-600/30 rounded-2xl space-y-3">
        <div className="h-4 w-36 bg-brand-400/40 rounded" />
        <div className="h-8 w-44 bg-brand-300/40 rounded-lg" />
        <div className="flex gap-4 pt-2 border-t border-brand-500/20">
          <div className="h-3.5 w-28 bg-brand-400/30 rounded" />
          <div className="h-3.5 w-24 bg-brand-400/30 rounded" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
        <div className="flex-1 h-8 rounded-lg bg-white" />
        <div className="flex-1 h-8 rounded-lg bg-slate-100" />
        <div className="flex-1 h-8 rounded-lg bg-slate-100" />
      </div>

      {/* History Items List */}
      <div className="space-y-3 pt-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5"
          >
            <div className="flex justify-between items-center">
              <div className="h-4 w-32 bg-slate-200 rounded" />
              <div className="h-6 w-16 rounded-full bg-slate-100" />
            </div>
            <div className="space-y-1">
              <div className="h-3.5 w-44 bg-slate-100 rounded" />
              <div className="h-3 w-36 bg-slate-100 rounded" />
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
              <div className="h-3 w-24 bg-slate-100 rounded" />
              <div className="h-4 w-20 bg-brand-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
