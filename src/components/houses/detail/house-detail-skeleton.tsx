import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton placeholder matching HouseCatalogueView:
 * cover banner, overlapping logo, identity header, gallery, category nav,
 * article grid, practical info, reviews, and right-side decision card.
 */
export function HouseDetailSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement du catalogue du pressing"
      className="flex-1 flex flex-col bg-background pb-28 font-sans"
    >
      {/* 1. Cover Banner Skeleton */}
      <div className="relative w-full bg-background">
        <Skeleton className="w-full aspect-[16/9] md:aspect-[4/1] max-h-[320px] rounded-none" />
        {/* Overlapping Logo */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="absolute -top-12 sm:-top-14 left-4 sm:left-6 size-24 sm:size-28 rounded-2xl sm:rounded-3xl bg-card p-1.5 shadow-xs ring-4 ring-background z-10 flex items-center justify-center">
            <Skeleton className="w-full h-full rounded-xl sm:rounded-2xl" />
          </div>
        </div>
      </div>

      {/* 2. Identity Header */}
      <div className="w-full bg-card border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-18 pb-6 space-y-3">
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-7 sm:h-9 w-48 sm:w-64 rounded-lg" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Skeleton className="h-4 w-36 rounded-md" />
                <span className="text-muted-foreground/40">•</span>
                <Skeleton className="h-4 w-28 rounded-md" />
                <span className="text-muted-foreground/40">•</span>
                <Skeleton className="h-5 w-28 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Gallery Strip */}
      <div className="w-full bg-card border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-3.5 w-48 rounded-md" />
            <Skeleton className="h-7 w-28 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
            ))}
          </div>
        </div>
      </div>

      {/* 4. Sticky Category Nav */}
      <div className="sticky top-0 z-20 bg-card/95 backdrop-blur-md border-b border-border/60 py-3 space-y-2.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-2.5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <Skeleton className="h-10 sm:h-9 w-full max-w-md rounded-xl" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-28 rounded-xl" />
              <Skeleton className="h-9 w-28 rounded-xl" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-7 w-20 sm:w-24 rounded-full shrink-0" />
            ))}
          </div>
        </div>
      </div>

      {/* 5. Main Grid: Left content + Right decision card */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-10">
            {/* Articles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-3xl border border-border p-4 sm:p-5 flex flex-col justify-between bg-card space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-16 rounded-full" />
                      <Skeleton className="h-3 w-20 rounded-md" />
                    </div>
                    <Skeleton className="h-5 w-36 rounded-md" />
                    <div className="flex gap-1.5 pt-1">
                      <Skeleton className="h-6 w-14 rounded-xl" />
                      <Skeleton className="h-6 w-14 rounded-xl" />
                    </div>
                    <Skeleton className="h-6 w-24 rounded-md pt-1" />
                  </div>
                  <div className="pt-3 border-t border-border">
                    <Skeleton className="h-9 w-full rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>

            {/* Neighborhood Delivery Selector */}
            <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-muted/40 dark:bg-card/75 border border-border/80 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2">
                <Skeleton className="size-6 rounded-md" />
                <Skeleton className="h-4 w-28 rounded-md" />
              </div>
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>

            {/* Practical Information */}
            <div className="bg-card rounded-2xl shadow-xs p-5 sm:p-6 space-y-6">
              <Skeleton className="h-6 w-44 rounded-md" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-card rounded-2xl shadow-xs p-5 sm:p-6 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-border/60">
                <Skeleton className="h-6 w-36 rounded-md" />
                <Skeleton className="h-8 w-28 rounded-lg" />
              </div>
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
          </div>

          {/* Right Column: Sticky Decision Card */}
          <div className="hidden lg:block">
            <div className="sticky top-20 bg-card rounded-2xl p-5 border border-border/80 shadow-xs space-y-5">
              <div className="space-y-1 pb-4 border-b border-border/60">
                <Skeleton className="h-5 w-40 rounded-md" />
                <Skeleton className="h-3.5 w-60 rounded-md" />
              </div>
              <div className="space-y-3 pt-1">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
              <div className="pt-2 border-t border-border/60 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-28 rounded-md" />
                  <Skeleton className="h-4 w-12 rounded-md" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20 rounded-md" />
                  <Skeleton className="h-6 w-24 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
