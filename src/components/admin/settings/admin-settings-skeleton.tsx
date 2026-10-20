/**
 * Skeleton placeholder matching the Admin Platform Settings page (/admin/settings).
 */
export function AdminSettingsSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement des paramètres de la plateforme"
      className="space-y-6 font-sans animate-pulse"
    >
      {/* Header */}
      <div className="border-b border-border pb-5 space-y-1.5">
        <div className="h-7 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="h-4 w-80 bg-slate-100 dark:bg-slate-800 rounded" />
      </div>

      {/* 2-column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Platform Settings Form */}
        <div className="p-6 bg-card rounded-xl border border-border shadow-xs space-y-5">
          <div className="h-5 w-44 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 w-36 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-9 w-full bg-slate-100 dark:bg-slate-800 rounded-md" />
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <div className="h-9 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          </div>
        </div>

        {/* Right: Exchange Rate Form & Rates History */}
        <div className="space-y-6">
          <div className="p-6 bg-card rounded-xl border border-border shadow-xs space-y-4">
            <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-9 w-full bg-slate-100 dark:bg-slate-800 rounded-md" />
              </div>
              <div className="flex justify-end pt-1">
                <div className="h-9 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              </div>
            </div>
          </div>

          <div className="p-6 bg-card rounded-xl border border-border shadow-xs space-y-4">
            <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-slate-50 dark:bg-slate-800/60 rounded-lg px-3 flex items-center justify-between">
                  <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Data Export Card */}
      <div className="p-6 bg-card rounded-xl border border-border shadow-xs space-y-4">
        <div className="h-5 w-44 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="flex flex-wrap gap-3">
          <div className="h-9 w-36 bg-slate-100 dark:bg-slate-800 rounded-lg" />
          <div className="h-9 w-36 bg-slate-100 dark:bg-slate-800 rounded-lg" />
          <div className="h-9 w-36 bg-slate-100 dark:bg-slate-800 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
