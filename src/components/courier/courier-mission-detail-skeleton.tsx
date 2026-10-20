/**
 * Skeleton placeholder matching the courier mission execution detail screen (/courier/missions/[missionId]).
 */
export function CourierMissionDetailSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement des détails de la mission"
      className="space-y-4 pb-20 animate-pulse"
    >
      {/* Top Navigation & Type Badge */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 bg-slate-200 rounded" />
        <div className="h-6 w-20 rounded-full bg-slate-100" />
      </div>

      {/* Location / Contact Card */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="h-4 w-36 bg-slate-200 rounded" />
          <div className="h-3.5 w-24 bg-slate-100 rounded" />
        </div>

        {/* Customer coordinates */}
        <div className="space-y-2 pt-1">
          <div className="h-4 w-48 bg-slate-200 rounded" />
          <div className="h-3 w-40 bg-slate-100 rounded" />
          <div className="h-4 w-32 bg-slate-100 rounded" />
        </div>

        {/* House coordinates */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="h-4 w-36 bg-slate-200 rounded" />
          <div className="h-4 w-16 bg-slate-100 rounded" />
        </div>
      </div>

      {/* Execution Form Card */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
        <div className="space-y-1.5">
          <div className="h-4 w-40 bg-slate-200 rounded" />
          <div className="h-3 w-56 bg-slate-100 rounded" />
        </div>

        {/* Form fields skeleton */}
        <div className="space-y-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex justify-between items-center">
              <div className="h-4 w-28 bg-slate-200 rounded" />
              <div className="h-8 w-20 bg-slate-150 rounded-lg" />
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex justify-between items-center">
              <div className="h-4 w-28 bg-slate-200 rounded" />
              <div className="h-8 w-20 bg-slate-150 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <div className="h-12 w-full bg-brand-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
