/**
 * Skeleton placeholder matching the Admin Neighborhoods & Zones page (/admin/neighborhoods).
 */
export function AdminNeighborhoodsSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement des quartiers et zones"
      className="space-y-6 font-sans animate-pulse"
    >
      {/* Header */}
      <div className="space-y-1.5">
        <div className="h-7 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="h-4 w-80 bg-slate-100 dark:bg-slate-800 rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Zones Card */}
        <div className="lg:col-span-1 bg-card p-5 rounded-xl border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
          </div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg" />
            ))}
          </div>
          <div className="pt-2 border-t border-border space-y-3">
            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-9 w-full bg-slate-100 dark:bg-slate-800 rounded-md" />
            <div className="h-9 w-full bg-slate-200 dark:bg-slate-700 rounded-lg" />
          </div>
        </div>

        {/* Right: Neighborhoods Table & Add Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
            </div>
            <div className="h-10 bg-slate-50 dark:bg-slate-800 border-b border-border flex items-center px-4" />
            <div className="divide-y divide-border">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 px-4 flex items-center justify-between gap-4">
                  <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-5 w-20 bg-slate-100 dark:bg-slate-800 rounded-full" />
                  <div className="h-5 w-16 bg-slate-100 dark:bg-slate-800 rounded-full" />
                  <div className="h-7 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card p-5 rounded-xl border border-border shadow-xs space-y-4">
            <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-9 w-full bg-slate-100 dark:bg-slate-800 rounded-md" />
              </div>
              <div className="space-y-1.5">
                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-9 w-full bg-slate-100 dark:bg-slate-800 rounded-md" />
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <div className="h-9 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
