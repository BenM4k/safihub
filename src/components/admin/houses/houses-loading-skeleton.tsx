export function HousesLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-border">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-4 w-72 bg-slate-200 dark:bg-slate-700 rounded-md" />
          <div className="flex items-center gap-2 pt-2">
            <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          </div>
        </div>
        <div className="h-10 w-44 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-card rounded-2xl border-2 border-border-strong overflow-hidden">
        <div className="p-4 border-b-2 border-border-strong bg-surface flex items-center justify-between gap-4">
          <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="flex items-center gap-2">
            <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          </div>
        </div>

        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-14 w-full bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center px-4 justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="size-10 bg-slate-200 dark:bg-slate-700 rounded-lg shrink-0" />
                <div className="space-y-1">
                  <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              </div>
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded hidden sm:block" />
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded hidden md:block" />
              <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-md" />
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded text-right" />
              <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
