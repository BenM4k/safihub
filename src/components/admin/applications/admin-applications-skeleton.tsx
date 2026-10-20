/**
 * Skeleton placeholder matching the Admin Partner Applications list (/admin/applications).
 */
export function AdminApplicationsSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement des candidatures partenaires"
      className="space-y-6 font-sans animate-pulse"
    >
      {/* Page Header */}
      <div className="space-y-1.5">
        <div className="h-7 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="h-4 w-80 bg-slate-100 dark:bg-slate-800 rounded" />
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <div className="h-7 w-20 bg-primary/20 rounded-lg" />
        <div className="h-7 w-24 bg-slate-100 dark:bg-slate-800 rounded-lg" />
        <div className="h-7 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg" />
        <div className="h-7 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg" />
      </div>

      {/* Applications Table Card */}
      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
        </div>
        <div className="h-10 bg-slate-50 dark:bg-slate-800 border-b border-border flex items-center px-4" />
        <div className="divide-y divide-border">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 px-4 flex items-center justify-between gap-4">
              <div className="space-y-1.5 w-44">
                <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
              </div>
              <div className="space-y-1.5 w-36">
                <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
              </div>
              <div className="space-y-1.5 w-36">
                <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
              </div>
              <div className="h-6 w-20 bg-slate-100 dark:bg-slate-800 rounded-full" />
              <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
