export function CustomersLoadingSkeleton() {
  return (
    <div className="space-y-5 animate-pulse" aria-busy="true" aria-label="Chargement des clients">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b-2 border-border-strong">
        <div className="space-y-2">
          <div className="h-7 w-36 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-4 w-72 bg-slate-200 dark:bg-slate-700 rounded-md" />
          <div className="flex items-center gap-2 pt-2">
            <div className="h-7 w-28 bg-slate-200 dark:bg-slate-700 rounded-xl border-2 border-border-strong" />
            <div className="h-7 w-24 bg-slate-200 dark:bg-slate-700 rounded-xl border-2 border-border-strong" />
            <div className="h-7 w-24 bg-slate-200 dark:bg-slate-700 rounded-xl border-2 border-border-strong" />
          </div>
        </div>
        <div className="h-10 w-44 bg-slate-200 dark:bg-slate-700 rounded-xl border-2 border-border-strong" />
      </div>

      {/* Toolbar Skeleton */}
      <div className="bg-card rounded-xl border-2 border-border-strong p-4 space-y-3 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="h-10 w-full max-w-md bg-slate-200 dark:bg-slate-700 rounded-lg border-2 border-border-strong" />
          <div className="flex items-center gap-2 flex-wrap">
            <div className="h-10 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg border-2 border-border-strong" />
            <div className="h-10 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg border-2 border-border-strong" />
            <div className="h-10 w-36 bg-slate-200 dark:bg-slate-700 rounded-lg border-2 border-border-strong" />
            <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg border-2 border-border-strong" />
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-card rounded-xl border-2 border-border-strong shadow-xs overflow-hidden flex flex-col">
        <div className="h-11 border-b-2 border-border-strong bg-slate-50 flex items-center px-4 justify-between gap-4">
          <div className="h-3.5 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-700 rounded hidden sm:block" />
          <div className="h-3.5 w-28 bg-slate-200 dark:bg-slate-700 rounded hidden md:block" />
          <div className="h-3.5 w-16 bg-slate-200 dark:bg-slate-700 rounded hidden lg:block" />
          <div className="h-3.5 w-20 bg-slate-200 dark:bg-slate-700 rounded hidden sm:block" />
          <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-700 rounded hidden md:block" />
          <div className="h-3.5 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-3.5 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>

        <div className="divide-y divide-border-strong">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-[52px] flex items-center px-4 justify-between gap-4"
            >
              <div className="flex flex-col gap-1.5 w-32">
                <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-2.5 w-16 bg-slate-200 dark:bg-slate-700 rounded sm:hidden" />
              </div>
              <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-700 rounded hidden sm:block" />
              <div className="h-3.5 w-32 bg-slate-200 dark:bg-slate-700 rounded hidden md:block" />
              <div className="h-5 w-14 bg-slate-200 dark:bg-slate-700 rounded-full hidden lg:block" />
              <div className="h-3.5 w-12 bg-slate-200 dark:bg-slate-700 rounded hidden sm:block" />
              <div className="h-3.5 w-20 bg-slate-200 dark:bg-slate-700 rounded hidden md:block" />
              <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
              <div className="h-7 w-7 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
