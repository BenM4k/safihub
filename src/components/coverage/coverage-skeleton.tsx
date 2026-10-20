/**
 * Skeleton placeholder matching the customer coverage request page (/coverage).
 */
export function CoverageSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement du formulaire de couverture"
      className="max-w-xl mx-auto space-y-6 animate-pulse"
    >
      {/* Back link */}
      <div className="h-4 w-36 bg-slate-100 rounded" />

      {/* Main Form Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-5">
        <div className="space-y-2">
          <div className="h-7 w-60 bg-slate-200 rounded-lg" />
          <div className="h-4 w-full bg-slate-100 rounded" />
        </div>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <div className="h-3.5 w-24 bg-slate-100 rounded" />
            <div className="h-11 w-full bg-slate-50 border border-slate-200 rounded-xl" />
          </div>

          <div className="space-y-1.5">
            <div className="h-3.5 w-32 bg-slate-100 rounded" />
            <div className="h-11 w-full bg-slate-50 border border-slate-200 rounded-xl" />
          </div>

          <div className="space-y-1.5">
            <div className="h-3.5 w-40 bg-slate-100 rounded" />
            <div className="h-20 w-full bg-slate-50 border border-slate-200 rounded-xl" />
          </div>
        </div>

        <div className="h-12 w-full bg-brand-200 rounded-full mt-4" />
      </div>

      {/* Info card */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 space-y-2 shadow-2xs">
        <div className="h-4 w-40 bg-slate-200 rounded" />
        <div className="h-3.5 w-full bg-slate-100 rounded" />
      </div>
    </div>
  );
}
