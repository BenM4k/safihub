/**
 * Skeleton placeholder matching the Admin Couriers Management page (/admin/couriers).
 */
export function AdminCouriersSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement de la flotte de coursiers"
      className="space-y-6 font-sans animate-pulse"
    >
      {/* Page Header */}
      <div className="space-y-1.5">
        <div className="h-7 w-56 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="h-4 w-72 bg-slate-100 dark:bg-slate-800 rounded" />
      </div>

      {/* Courier Create Form Skeleton */}
      <div className="p-5 bg-card rounded-xl border border-border shadow-xs space-y-4">
        <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-9 w-full bg-slate-100 dark:bg-slate-800 rounded-md" />
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-1">
          <div className="h-9 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        </div>
      </div>

      {/* Couriers Table Skeleton */}
      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
        </div>
        <div className="h-10 bg-slate-50 dark:bg-slate-800 border-b border-border flex items-center px-4" />
        <div className="divide-y divide-border">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 px-4 flex items-center justify-between gap-4">
              <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-5 w-16 bg-slate-100 dark:bg-slate-800 rounded-full" />
              <div className="h-4 w-14 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
