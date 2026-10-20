/**
 * Skeleton placeholder matching HouseCatalogueView (cover banner, identity header,
 * article grid, and right-side decision card).
 */
export function HouseDetailSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement du catalogue du pressing"
      className="flex-1 flex flex-col bg-background pb-20 animate-pulse"
    >
      {/* Cover Banner Skeleton */}
      <div className="h-44 sm:h-64 lg:h-80 w-full bg-muted" />

      {/* Identity Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-12 sm:-mt-16 mb-8">
        <div className="bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-xs flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4 sm:gap-6">
            <div className="size-20 sm:size-24 rounded-2xl bg-muted border-4 border-card shadow-sm shrink-0" />
            <div className="space-y-2">
              <div className="h-7 sm:h-9 w-48 sm:w-64 bg-muted rounded-lg" />
              <div className="h-4 w-40 bg-muted/60 rounded" />
              <div className="flex gap-2 pt-1">
                <div className="h-6 w-20 rounded-full bg-muted/60" />
                <div className="h-6 w-24 rounded-full bg-muted/60" />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-32 bg-muted rounded-xl" />
          </div>
        </div>
      </div>

      {/* Main Grid: Articles + Decision Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Category navigation + Articles */}
          <div className="lg:col-span-8 space-y-6">
            {/* Category tabs row */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <div className="h-10 w-28 rounded-full bg-primary/20" />
              <div className="h-10 w-24 rounded-full bg-muted" />
              <div className="h-10 w-32 rounded-full bg-muted" />
              <div className="h-10 w-24 rounded-full bg-muted" />
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-2xs"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 w-32 bg-muted rounded" />
                      <div className="h-3 w-44 bg-muted/60 rounded" />
                    </div>
                    <div className="size-16 rounded-xl bg-muted shrink-0" />
                  </div>
                  <div className="pt-2 flex justify-between items-center border-t border-border">
                    <div className="h-5 w-20 bg-primary/20 rounded" />
                    <div className="h-8 w-20 bg-muted rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Decision Card */}
          <div className="lg:col-span-4 rounded-3xl border border-border bg-card p-6 shadow-xs space-y-5 sticky top-24">
            <div className="h-5 w-36 bg-muted rounded" />
            <div className="space-y-3 pt-2">
              <div className="h-12 w-full bg-muted/50 border border-border rounded-xl" />
              <div className="h-12 w-full bg-muted/50 border border-border rounded-xl" />
            </div>
            <div className="pt-4 border-t border-border space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-20 bg-muted/60 rounded" />
                <div className="h-4 w-24 bg-muted rounded" />
              </div>
            </div>
            <div className="h-12 w-full bg-primary/30 rounded-full mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
