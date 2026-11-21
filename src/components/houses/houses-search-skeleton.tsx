import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton placeholder matching HousesSplitView 1:1:
 * - Search top bar (search input, service chips, open now, all filters, view switchers, save search)
 * - Main split layout:
 *   - Left column (58% / 52%): Results header + 2-column house cards grid
 *   - Right column: Map placeholder
 */
export function HousesSearchSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Recherche des pressings partenaires"
      className="flex flex-col h-[calc(100dvh-5rem)] bg-background overflow-hidden"
    >
      {/* Sticky Search Top Bar Skeleton */}
      <div className="w-full bg-card/95 backdrop-blur-md border-b border-border px-4 sm:px-6 py-3 sticky top-0 z-30 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Search input + Quick filter pills */}
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Skeleton className="h-10 w-full rounded-full" />
            </div>

            {/* Service filter quick pills (hidden on mobile, visible on sm+) */}
            <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto py-0.5">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>

            {/* Open now toggle button */}
            <Skeleton className="h-8 w-28 rounded-full" />

            {/* All filters button */}
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>

          {/* Right: View switchers & Save Search */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5">
            <Skeleton className="h-8 w-36 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-full" />
          </div>
        </div>
      </div>

      {/* Main Split Layout: Cards on Left, Map on Right */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Column: House Cards List */}
        <div className="w-full lg:w-[58%] xl:w-[52%] flex flex-col h-full bg-background dark:bg-card/20 overflow-y-auto px-4 sm:px-6 py-5">
          {/* Results Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
            <Skeleton className="h-5 w-44 rounded-md" />
            <Skeleton className="h-8 w-36 rounded-xl" />
          </div>

          {/* 2-column House Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-12">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="relative flex flex-col justify-between min-h-[300px] sm:min-h-[320px] rounded-2xl bg-muted border border-border overflow-hidden p-4"
              >
                {/* Top Status & Quick Actions */}
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-28 rounded-full" />
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="size-8 rounded-full" />
                    <Skeleton className="size-8 rounded-full" />
                  </div>
                </div>

                {/* Bottom Details Overlay */}
                <div className="mt-auto space-y-3">
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 flex-1">
                      <Skeleton className="size-10 rounded-xl shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-5 w-36 rounded-md" />
                        <Skeleton className="h-3.5 w-44 rounded-md" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-14 rounded-full shrink-0" />
                  </div>

                  <div className="flex items-center gap-3">
                    <Skeleton className="h-3.5 w-20 rounded-md" />
                    <Skeleton className="h-3.5 w-24 rounded-md" />
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-7 w-28 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Interactive Bukavu Map Placeholder */}
        <div className="hidden lg:flex flex-1 h-full border-l border-border bg-muted/40 relative">
          <Skeleton className="w-full h-full rounded-none" />
        </div>
      </div>
    </div>
  );
}
