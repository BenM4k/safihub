/**
 * Skeleton placeholder matching the customer orders list page (/orders).
 */
export function OrdersListSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement de vos commandes"
      className="max-w-5xl mx-auto w-full flex-1 flex flex-col space-y-6 animate-pulse"
    >
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-4 w-20 bg-slate-100 rounded" />
          <div className="h-8 w-48 bg-slate-200 rounded-lg" />
          <div className="h-4 w-72 bg-slate-100 rounded" />
        </div>
        <div className="h-10 w-40 bg-brand-200 rounded-xl" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-2 border-b border-slate-200/80 pb-3">
        <div className="h-9 w-36 rounded-full bg-slate-200" />
        <div className="h-9 w-32 rounded-full bg-slate-100" />
      </div>

      {/* Order Cards List */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-2xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-slate-100 shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-4 w-36 bg-slate-200 rounded" />
                  <div className="h-3 w-24 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="h-7 w-28 rounded-full bg-slate-100" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex gap-4">
                <div className="space-y-1">
                  <div className="h-3 w-16 bg-slate-100 rounded" />
                  <div className="h-4 w-24 bg-slate-200 rounded" />
                </div>
                <div className="space-y-1">
                  <div className="h-3 w-16 bg-slate-100 rounded" />
                  <div className="h-4 w-28 bg-brand-100 rounded" />
                </div>
              </div>
              <div className="h-9 w-28 bg-slate-100 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
