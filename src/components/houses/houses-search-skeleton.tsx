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
      className="flex-1 flex flex-col h-[calc(100dvh-4.5rem)] overflow-hidden animate-pulse bg-background"
    >
      {/* Search Top Bar skeleton */}
      <div className="border-b border-border bg-card px-4 py-3 sm:px-6 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 max-w-7xl mx-auto w-full">
          {/* Search input pill */}
          <div className="h-11 w-full sm:max-w-md bg-muted rounded-full border border-border" />
          {/* Filter action pills */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <div className="h-9 w-24 rounded-full bg-muted border border-border" />
            <div className="h-9 w-28 rounded-full bg-muted border border-border" />
            <div className="h-9 w-20 rounded-full bg-muted border border-border" />
          </div>
        </div>

        {/* Neighborhood chips horizontal row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-7xl mx-auto w-full">
          <div className="h-7 w-20 rounded-full bg-primary/20" />
          <div className="h-7 w-24 rounded-full bg-muted" />
          <div className="h-7 w-28 rounded-full bg-muted" />
          <div className="h-7 w-20 rounded-full bg-muted" />
          <div className="h-7 w-24 rounded-full bg-muted" />
        </div>
      </div>

      {/* Split View Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: House cards list panel */}
        <div className="w-full lg:w-[480px] xl:w-[540px] border-r border-border overflow-y-auto p-4 sm:p-5 space-y-4 shrink-0">
          <div className="flex justify-between items-center pb-2">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted/60 rounded" />
          </div>

          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-4 shadow-2xs space-y-3"
            >
              <div className="flex gap-3.5">
                <div className="size-20 rounded-xl bg-muted shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="flex justify-between items-start">
                    <div className="h-4 w-36 bg-muted rounded" />
                    <div className="h-5 w-12 bg-amber-500/20 rounded" />
                  </div>
                  <div className="h-3 w-28 bg-muted/60 rounded" />
                  <div className="flex gap-1.5 pt-1">
                    <div className="h-5 w-16 bg-muted rounded-md" />
                    <div className="h-5 w-20 bg-muted rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Map placeholder */}
        <div className="hidden lg:flex flex-1 bg-muted/30 items-center justify-center p-8 relative overflow-hidden">
          <div className="size-16 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
