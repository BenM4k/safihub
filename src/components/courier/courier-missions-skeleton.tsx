/**
 * Skeleton placeholder matching the courier active missions list (/courier).
 */
export function CourierMissionsSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement des missions assignées"
      className="space-y-4 pb-20 animate-pulse"
    >
      {/* Offline banner placeholder / sync indicator */}
      <div className="h-10 w-full rounded-xl bg-slate-100" />

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
        <div className="flex-1 h-8 rounded-lg bg-white" />
        <div className="flex-1 h-8 rounded-lg bg-slate-100" />
        <div className="flex-1 h-8 rounded-lg bg-slate-100" />
      </div>

      {/* Mission Cards */}
      <div className="space-y-3.5 pt-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3"
          >
            {/* Top row */}
            <div className="flex items-center justify-between">
              <div className="h-6 w-20 rounded-full bg-slate-100" />
              <div className="h-4 w-28 bg-slate-100 rounded" />
            </div>

            {/* Middle row */}
            <div className="space-y-1.5 pt-1">
              <div className="h-4 w-40 bg-slate-200 rounded" />
              <div className="h-3 w-52 bg-slate-100 rounded" />
              <div className="h-3 w-36 bg-slate-100 rounded" />
            </div>

            {/* Bottom row: earnings & button */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="space-y-1">
                <div className="h-3 w-16 bg-slate-100 rounded" />
                <div className="h-4 w-24 bg-brand-100 rounded" />
              </div>
              <div className="h-9 w-28 bg-brand-200 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
