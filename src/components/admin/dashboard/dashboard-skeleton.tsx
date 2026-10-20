/**
 * Skeleton placeholder matching the Admin Dashboard layout (/admin).
 */
export function DashboardSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement du tableau de bord administrateur"
      className="space-y-6 pb-12 animate-pulse"
    >
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1.5">
          <div className="h-7 w-52 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-4 w-72 bg-slate-100 dark:bg-slate-800 rounded" />
        </div>
        <div className="h-10 w-44 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      </div>

      {/* 2. Urgent Attention Alert */}
      <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-5 w-48 bg-amber-500/20 rounded" />
          <div className="h-6 w-20 rounded-full bg-amber-500/20" />
        </div>
        <div className="h-4 w-3/4 bg-amber-500/15 rounded" />
      </div>

      {/* 3. 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-card border border-border space-y-3 shadow-2xs"
          >
            <div className="flex justify-between items-center">
              <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="h-7 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>

      {/* 4. Live Operations: Orders + Fleet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-card border border-border space-y-4 shadow-2xs">
          <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="space-y-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-slate-50 dark:bg-slate-800 rounded-xl" />
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 p-5 rounded-2xl bg-card border border-border space-y-4 shadow-2xs">
          <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-slate-50 dark:bg-slate-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
