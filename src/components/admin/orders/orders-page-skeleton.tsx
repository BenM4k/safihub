/**
 * Skeleton placeholder matching the Admin Orders Management page (/admin/orders).
 */
export function OrdersPageSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement du registre des commandes"
      className="space-y-6 font-sans animate-pulse"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-border-strong pb-5">
        <div className="space-y-1.5">
          <div className="h-7 w-52 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-4 w-72 bg-slate-100 dark:bg-slate-800 rounded" />
        </div>
        <div className="h-10 w-44 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      </div>

      {/* Filter toolbar */}
      <div className="p-4 rounded-xl bg-card border-2 border-border-strong flex flex-col sm:flex-row justify-between gap-3">
        <div className="h-10 w-full sm:max-w-md bg-slate-100 dark:bg-slate-800 rounded-lg" />
        <div className="flex gap-2">
          <div className="h-10 w-28 bg-slate-100 dark:bg-slate-800 rounded-lg" />
          <div className="h-10 w-28 bg-slate-100 dark:bg-slate-800 rounded-lg" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border-2 border-border-strong bg-card overflow-hidden">
        <div className="h-11 bg-slate-50 dark:bg-slate-800 border-b border-border flex items-center px-4" />
        <div className="divide-y divide-border">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-14 px-4 flex items-center justify-between gap-4">
              <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-6 w-20 bg-slate-100 dark:bg-slate-800 rounded-full" />
              <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
