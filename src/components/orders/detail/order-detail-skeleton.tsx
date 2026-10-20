/**
 * Skeleton placeholder matching the order detail page (/orders/[orderId]) and public tracking page (/track/[token]).
 */
export function OrderDetailSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement des détails de la commande"
      className="max-w-5xl mx-auto w-full flex-1 flex flex-col space-y-6 animate-pulse"
    >
      {/* Top navigation row */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-36 bg-slate-100 rounded" />
        <div className="h-4 w-28 bg-slate-100 rounded" />
      </div>

      {/* Code badge */}
      <div className="h-16 w-full rounded-2xl bg-brand-50 border border-brand-100 p-4 flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-3 w-32 bg-brand-200 rounded" />
          <div className="h-5 w-24 bg-brand-300 rounded" />
        </div>
        <div className="h-8 w-20 bg-brand-200 rounded-lg" />
      </div>

      {/* Order Header Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-44 bg-slate-200 rounded-lg" />
          <div className="h-4 w-32 bg-slate-100 rounded" />
          <div className="h-3.5 w-52 bg-slate-100 rounded" />
        </div>
        <div className="h-8 w-32 rounded-full bg-slate-100" />
      </div>

      {/* Main Grid: Items & Photos on Left, Timeline on Right */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Column (col-span-2) */}
        <div className="md:col-span-2 space-y-6">
          {/* Items Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <div className="h-5 w-36 bg-slate-200 rounded" />
            <div className="divide-y divide-slate-100">
              {[1, 2, 3].map((i) => (
                <div key={i} className="py-3 flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="h-4 w-32 bg-slate-200 rounded" />
                    <div className="h-3 w-20 bg-slate-100 rounded" />
                  </div>
                  <div className="h-4 w-20 bg-brand-100 rounded" />
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <div className="h-5 w-24 bg-slate-200 rounded" />
              <div className="h-6 w-32 bg-brand-200 rounded-lg" />
            </div>
          </div>

          {/* Photos Gallery */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <div className="h-5 w-40 bg-slate-200 rounded" />
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-square rounded-2xl bg-slate-100" />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Timeline (col-span-1) */}
        <div className="md:col-span-1 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="h-5 w-32 bg-slate-200 rounded" />
          <div className="space-y-6 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="size-6 rounded-full bg-slate-200 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-28 bg-slate-200 rounded" />
                  <div className="h-3 w-36 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
