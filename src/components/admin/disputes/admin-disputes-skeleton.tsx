/**
 * Skeleton placeholder matching the Admin Disputes Management page (/admin/disputes).
 */
export function AdminDisputesSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement des litiges"
      className="space-y-6 font-sans animate-pulse"
    >
      {/* Header */}
      <div className="space-y-1.5">
        <div className="h-7 w-56 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="h-4 w-72 bg-slate-100 dark:bg-slate-800 rounded" />
      </div>

      {/* Disputes List Skeleton */}
      <div className="grid grid-cols-1 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-card rounded-2xl border border-border p-5 shadow-2xs space-y-3"
          >
            {/* Top row: Badges and date */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-20 bg-slate-100 dark:bg-slate-800 rounded-full" />
                <div className="h-6 w-24 bg-slate-100 dark:bg-slate-800 rounded-md" />
              </div>
              <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
            </div>

            {/* Description box */}
            <div className="h-16 w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-border" />

            {/* Bottom link */}
            <div className="pt-1">
              <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
