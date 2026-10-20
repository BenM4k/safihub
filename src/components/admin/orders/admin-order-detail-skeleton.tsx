/**
 * Skeleton placeholder matching the Admin Order Detail view (/admin/orders/[orderId]).
 */
export function AdminOrderDetailSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement du dossier de commande"
      className="space-y-6 animate-pulse"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1.5">
          <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
          <div className="flex items-center gap-3">
            <div className="h-7 w-44 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-6 w-20 bg-brand-100 rounded-full" />
          </div>
          <div className="h-3.5 w-48 bg-slate-100 dark:bg-slate-800 rounded" />
        </div>
        <div className="h-9 w-36 bg-slate-100 dark:bg-slate-800 rounded-lg border border-border" />
      </div>

      {/* 3 Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-2.5"
          >
            <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
            <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded" />
            <div className="h-3.5 w-4/5 bg-slate-100 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>

      {/* Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-card border border-border space-y-4 shadow-2xs">
          <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-50 dark:bg-slate-800 rounded-xl" />
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 p-5 rounded-2xl bg-card border border-border space-y-4 shadow-2xs">
          <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-slate-50 dark:bg-slate-800 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
