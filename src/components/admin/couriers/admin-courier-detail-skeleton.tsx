/**
 * Skeleton placeholder matching the Admin Courier Detail page (/admin/couriers/[courierId]).
 */
export function AdminCourierDetailSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement du profil coursier"
      className="space-y-6 font-sans animate-pulse"
    >
      {/* Top Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-3 w-3 bg-slate-100 dark:bg-slate-800 rounded" />
          <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="h-8 w-60 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="h-4 w-48 bg-slate-100 dark:bg-slate-800 rounded" />
      </div>

      {/* Tabs list skeleton */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
        <div className="h-8 w-20 bg-primary/20 rounded-lg" />
        <div className="h-8 w-28 bg-slate-100 dark:bg-slate-800 rounded-lg" />
        <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 rounded-lg" />
      </div>

      {/* Profile Form Card Skeleton */}
      <div className="p-5 bg-card rounded-xl border border-border shadow-xs space-y-5">
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-9 w-full bg-slate-100 dark:bg-slate-800 rounded-md" />
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-2">
          <div className="h-9 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
