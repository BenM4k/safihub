/**
 * Skeleton placeholder matching the partner application page (/partners/apply).
 */
export function PartnerApplySkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement du formulaire de candidature partenaire"
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse"
    >
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 space-y-3">
        <div className="h-6 w-44 rounded-full bg-slate-200 mx-auto" />
        <div className="h-9 w-3/4 max-w-md bg-slate-200 rounded-xl mx-auto" />
        <div className="h-4 w-5/6 max-w-lg bg-slate-100 rounded mx-auto" />
      </div>

      {/* Grid: Form on Left, Benefits on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Skeleton (col-span-2) */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
          <div className="h-6 w-48 bg-slate-200 rounded-lg" />
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <div className="h-3.5 w-32 bg-slate-100 rounded" />
              <div className="h-11 w-full bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3.5 w-24 bg-slate-100 rounded" />
              <div className="h-11 w-full bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3.5 w-36 bg-slate-100 rounded" />
              <div className="h-11 w-full bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3.5 w-28 bg-slate-100 rounded" />
              <div className="h-20 w-full bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
          </div>
          <div className="h-12 w-full bg-brand-200 rounded-full mt-4" />
        </div>

        {/* Benefits Skeleton (col-span-1) */}
        <div className="lg:col-span-1 p-6 rounded-3xl bg-slate-100/80 border border-slate-200/80 space-y-4">
          <div className="h-5 w-36 bg-slate-200 rounded" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="size-8 rounded-xl bg-slate-200 shrink-0" />
                <div className="space-y-1 flex-1">
                  <div className="h-4 w-28 bg-slate-200 rounded" />
                  <div className="h-3 w-full bg-slate-150 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
