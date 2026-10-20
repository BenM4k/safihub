/**
 * Skeleton placeholder matching the 2-column cart layout (items list + summary card).
 */
export function CartSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement du panier"
      className="w-full max-w-6xl mx-auto py-8 sm:py-10 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col animate-pulse"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-5 mb-6">
        <div className="space-y-2">
          <div className="h-8 w-44 bg-slate-200 rounded-lg" />
          <div className="h-4 w-64 bg-slate-100 rounded" />
        </div>
        <div className="h-9 w-28 bg-slate-100 rounded-xl" />
      </div>

      {/* Main Grid: Items + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left: Items list */}
        <div className="lg:col-span-8 space-y-3.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 flex items-center justify-between gap-4 shadow-2xs"
            >
              <div className="flex items-center gap-3.5">
                <div className="size-14 rounded-xl bg-slate-100 shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-4 w-36 bg-slate-200 rounded" />
                  <div className="h-3 w-24 bg-slate-100 rounded" />
                  <div className="h-4 w-28 bg-brand-100 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-24 bg-slate-100 rounded-xl" />
                <div className="size-9 bg-slate-100 rounded-xl" />
              </div>
            </div>
          ))}
        </div>

        {/* Right: Order Summary card */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="h-6 w-32 bg-slate-200 rounded-md pb-2 border-b border-slate-100" />
          <div className="space-y-3 pt-2">
            <div className="flex justify-between">
              <div className="h-4 w-20 bg-slate-100 rounded" />
              <div className="h-4 w-24 bg-slate-200 rounded" />
            </div>
            <div className="flex justify-between">
              <div className="h-4 w-28 bg-slate-100 rounded" />
              <div className="h-4 w-20 bg-slate-100 rounded" />
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <div className="h-5 w-16 bg-slate-200 rounded" />
              <div className="h-6 w-32 bg-brand-200 rounded-lg" />
            </div>
          </div>
          <div className="h-12 w-full bg-brand-300 rounded-full mt-4" />
        </div>
      </div>
    </div>
  );
}
