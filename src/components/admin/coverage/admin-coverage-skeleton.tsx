/**
 * Skeleton placeholder matching the Admin Coverage Management page (/admin/coverage).
 */
export function AdminCoverageSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement de la couverture géographique"
      className="space-y-6 font-sans animate-pulse"
    >
      {/* Header */}
      <div className="space-y-1.5">
        <div className="h-7 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="h-4 w-80 bg-slate-100 dark:bg-slate-800 rounded" />
      </div>

      {/* Distance Limit Form Skeleton */}
      <div className="p-5 bg-card rounded-xl border border-border shadow-xs space-y-4">
        <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="flex flex-col sm:flex-row items-end gap-4 max-w-md">
          <div className="space-y-1.5 w-full">
            <div className="h-3 w-36 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-9 w-full bg-slate-100 dark:bg-slate-800 rounded-md" />
          </div>
          <div className="h-9 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg shrink-0" />
        </div>
      </div>

      {/* Neighborhood Status Table Skeleton */}
      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
        </div>
        <div className="h-10 bg-slate-50 dark:bg-slate-800 border-b border-border flex items-center px-4" />
        <div className="divide-y divide-border">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 px-4 flex items-center justify-between gap-4">
              <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-3 w-28 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-6 w-20 bg-slate-100 dark:bg-slate-800 rounded-full" />
              <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Coverage Demand Table Skeleton */}
      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="h-4 w-44 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
        </div>
        <div className="h-10 bg-slate-50 dark:bg-slate-800 border-b border-border flex items-center px-4" />
        <div className="divide-y divide-border">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 px-4 flex items-center justify-between gap-4">
              <div className="h-3 w-36 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
