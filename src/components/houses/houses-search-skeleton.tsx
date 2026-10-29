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
                className="flex flex-col rounded-2xl bg-card border border-border overflow-hidden"
              >
                {/* Image aspect ratio 16/10 on mobile, 16/9 on sm+ */}
                <Skeleton className="w-full aspect-[16/10] sm:aspect-[16/9] rounded-none" />

                {/* Card Content Body */}
                <div className="p-4 flex flex-col flex-1 space-y-2.5">
                  {/* Price & delivery fee */}
                  <div className="flex items-baseline justify-between gap-2">
                    <Skeleton className="h-6 w-32 rounded-md" />
                    <Skeleton className="h-5 w-24 rounded-md" />
                  </div>

                  {/* Specs row */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-20 rounded-md" />
                    <Skeleton className="h-4 w-24 rounded-md" />
                    <Skeleton className="h-4 w-16 rounded-md" />
                  </div>

                  {/* House Name & Logo */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <Skeleton className="size-6 rounded-full shrink-0" />
                    <Skeleton className="h-5 w-36 rounded-md" />
                  </div>

                  {/* Address & Zone */}
                  <Skeleton className="h-3.5 w-48 rounded-md" />

                  {/* Services badges & CTA */}
                  <div className="mt-auto pt-3 border-t border-border flex items-center justify-between gap-2">
                    <div className="flex gap-1">
                      <Skeleton className="h-5 w-16 rounded-md" />
                      <Skeleton className="h-5 w-16 rounded-md" />
                    </div>
                    <Skeleton className="h-4 w-20 rounded-md" />
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
