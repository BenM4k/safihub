/**
 * Skeleton placeholder matching HousesSplitView (search bar, filter pills, house cards list, and interactive map placeholder).
 */
export function HousesSearchSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Recherche des pressings partenaires"
      className="flex-1 flex flex-col h-[calc(100dvh-4.5rem)] overflow-hidden animate-pulse bg-white"
    >
      {/* Search Top Bar skeleton */}
      <div className="border-b border-slate-200/80 bg-white px-4 py-3 sm:px-6 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 max-w-7xl mx-auto w-full">
          {/* Search input pill */}
          <div className="h-11 w-full sm:max-w-md bg-slate-100 rounded-full border border-slate-200" />
          {/* Filter action pills */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <div className="h-9 w-24 rounded-full bg-slate-100 border border-slate-200" />
            <div className="h-9 w-28 rounded-full bg-slate-100 border border-slate-200" />
            <div className="h-9 w-20 rounded-full bg-slate-100 border border-slate-200" />
          </div>
        </div>

        {/* Neighborhood chips horizontal row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-7xl mx-auto w-full">
          <div className="h-7 w-20 rounded-full bg-brand-100" />
          <div className="h-7 w-24 rounded-full bg-slate-100" />
          <div className="h-7 w-28 rounded-full bg-slate-100" />
          <div className="h-7 w-20 rounded-full bg-slate-100" />
          <div className="h-7 w-24 rounded-full bg-slate-100" />
        </div>
      </div>

      {/* Split View Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: House cards list panel */}
        <div className="w-full lg:w-[480px] xl:w-[540px] border-r border-slate-200/80 overflow-y-auto p-4 sm:p-5 space-y-4 shrink-0">
          <div className="flex justify-between items-center pb-2">
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="h-4 w-24 bg-slate-100 rounded" />
          </div>

          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-3"
            >
              <div className="flex gap-3.5">
                <div className="size-20 rounded-xl bg-slate-100 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="flex justify-between items-start">
                    <div className="h-4 w-36 bg-slate-200 rounded" />
                    <div className="h-5 w-12 bg-amber-100 rounded" />
                  </div>
                  <div className="h-3 w-28 bg-slate-100 rounded" />
                  <div className="flex gap-1.5 pt-1">
                    <div className="h-5 w-16 bg-slate-100 rounded-md" />
                    <div className="h-5 w-20 bg-slate-100 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Map placeholder */}
        <div className="hidden lg:flex flex-1 bg-slate-100 items-center justify-center p-8 relative overflow-hidden">
          <div className="size-16 rounded-full bg-slate-200/80 border border-slate-300 flex items-center justify-center text-slate-400" />
        </div>
      </div>
    </div>
  );
}
