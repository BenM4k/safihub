import { Skeleton } from "@/components/ui/skeleton";

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
      className="flex-1 flex flex-col h-[calc(100dvh-4.5rem)] overflow-hidden bg-background"
    >
      {/* Search Top Bar skeleton */}
      <div className="border-b border-border bg-card px-4 py-3 sm:px-6 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 max-w-7xl mx-auto w-full">
          {/* Search input pill */}
          <Skeleton className="h-11 w-full sm:max-w-md rounded-full" />
          {/* Filter action pills */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <Skeleton className="h-9 w-24 rounded-full" />
            <Skeleton className="h-9 w-28 rounded-full" />
            <Skeleton className="h-9 w-20 rounded-full" />
          </div>
        </div>

        {/* Neighborhood chips horizontal row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-7xl mx-auto w-full">
          <Skeleton className="h-7 w-20 rounded-full bg-primary/20" />
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-28 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
      </div>

      {/* Split View Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: House cards list panel */}
        <div className="w-full lg:w-[480px] xl:w-[540px] border-r border-border overflow-y-auto p-4 sm:p-5 space-y-4 shrink-0">
          <div className="flex justify-between items-center pb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>

          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-4 shadow-2xs space-y-3"
            >
              <div className="flex gap-3.5">
                <Skeleton className="size-20 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-5 w-12 bg-amber-500/20" />
                  </div>
                  <Skeleton className="h-3 w-28" />
                  <div className="flex gap-1.5 pt-1">
                    <Skeleton className="h-5 w-16 rounded-md" />
                    <Skeleton className="h-5 w-20 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Map placeholder */}
        <div className="hidden lg:flex flex-1 bg-muted/40 items-center justify-center p-8">
          <Skeleton className="w-full h-full rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
