/**
 * Skeleton placeholder matching the Admin Master Catalogue page (/admin/catalogue).
 */
export function AdminCatalogueSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement du catalogue maître"
      className="space-y-6 font-sans animate-pulse"
    >
      {/* Header */}
      <div className="space-y-1.5">
        <div className="h-7 w-56 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="h-4 w-72 bg-slate-100 dark:bg-slate-800 rounded" />
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
        <div className="h-8 w-28 bg-primary/20 rounded-lg" />
        <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 rounded-lg" />
        <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 rounded-lg" />
        <div className="h-8 w-36 bg-slate-100 dark:bg-slate-800 rounded-lg" />
      </div>

      {/* Quick Add Form Card */}
      <div className="p-5 bg-card rounded-xl border border-border shadow-xs space-y-4">
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-9 w-full bg-slate-100 dark:bg-slate-800 rounded-md" />
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-1">
          <div className="h-9 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        </div>
      </div>

      {/* Catalogue Table Card */}
      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        <div className="h-10 bg-slate-50 dark:bg-slate-800 border-b border-border flex items-center px-4" />
        <div className="divide-y divide-border">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-14 px-4 flex items-center justify-between gap-4">
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-3 w-28 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-5 w-16 bg-slate-100 dark:bg-slate-800 rounded-full" />
              <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
