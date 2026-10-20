/**
 * Skeleton placeholder matching the Admin Partner Application Detail page (/admin/applications/[applicationId]).
 */
export function AdminApplicationDetailSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement du dossier de candidature"
      className="space-y-6 max-w-4xl font-sans animate-pulse"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-lg bg-slate-200 dark:bg-slate-700" />
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-5 w-20 bg-slate-100 dark:bg-slate-800 rounded-full" />
          </div>
          <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
        </div>
      </div>

      {/* 2-column Grid: Applicant & Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Applicant Card */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-xs space-y-4">
          <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="h-3 w-12 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
            <div className="space-y-1">
              <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
            <div className="space-y-1">
              <div className="h-3 w-12 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
        </div>

        {/* Location Card */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-xs space-y-4">
          <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
            <div className="space-y-1">
              <div className="h-3 w-28 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Facilities & Infrastructure Card */}
      <div className="bg-card rounded-xl border border-border p-5 shadow-xs space-y-4">
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-2">
            <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-2">
            <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        </div>
      </div>

      {/* Review Section Skeleton */}
      <div className="bg-card rounded-xl border border-border p-5 shadow-xs space-y-4">
        <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="space-y-3">
          <div className="h-9 w-full bg-slate-100 dark:bg-slate-800 rounded-md" />
          <div className="h-20 w-full bg-slate-100 dark:bg-slate-800 rounded-md" />
          <div className="flex justify-end gap-3 pt-2">
            <div className="h-9 w-24 bg-slate-100 dark:bg-slate-800 rounded-lg" />
            <div className="h-9 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
