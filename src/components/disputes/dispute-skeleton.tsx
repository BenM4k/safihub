/**
 * Skeleton placeholder matching the dispute reporting form (/orders/[orderId]/dispute).
 */
export function DisputeSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement du formulaire de litige"
      className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6 animate-pulse"
    >
      {/* Back link */}
      <div className="h-4 w-48 bg-slate-200 rounded" />

      {/* Main card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="space-y-2">
          <div className="h-6 w-44 bg-slate-200 rounded-lg" />
          <div className="h-4 w-72 bg-slate-100 rounded" />
        </div>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="h-11 w-full bg-slate-50 border border-slate-200 rounded-xl" />
          </div>

          <div className="space-y-2">
            <div className="h-4 w-36 bg-slate-200 rounded" />
            <div className="h-28 w-full bg-slate-50 border border-slate-200 rounded-xl" />
          </div>

          <div className="space-y-2">
            <div className="h-4 w-40 bg-slate-200 rounded" />
            <div className="h-24 w-full bg-slate-50 border border-dashed border-slate-200 rounded-2xl" />
          </div>
        </div>

        <div className="h-12 w-full bg-rose-200 rounded-full mt-4" />
      </div>
    </div>
  );
}
