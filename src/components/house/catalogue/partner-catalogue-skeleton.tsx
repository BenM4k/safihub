import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton placeholder matching the partner catalogue page (/partner/[houseSlug]/catalogue).
 */
export function PartnerCatalogueSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement du catalogue"
      className="space-y-6 sm:space-y-8 pb-24 sm:pb-28 font-sans"
    >
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1.5">
          <Skeleton className="h-8 sm:h-9 w-48 sm:w-64 rounded-lg" />
          <Skeleton className="h-4 w-72 sm:w-96 rounded-md" />
        </div>
        <Skeleton className="h-9 w-44 rounded-lg shrink-0 self-start sm:self-auto" />
      </div>

      {/* 2. Catalogue Header & Progress Card */}
      <div className="space-y-6 sm:space-y-8">
        <div className="flex justify-end">
          <Skeleton className="h-4 w-36 rounded-md" />
        </div>

        {/* Progress Card */}
        <div
          data-tour-id="tour-catalogue-content"
          className="space-y-4 sm:space-y-5 py-2 font-sans"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Skeleton className="size-2 rounded-full" />
              <Skeleton className="h-4 w-40 rounded-md" />
            </div>
            <Skeleton className="h-4 w-32 rounded-md" />
          </div>

          <Skeleton className="h-2.5 w-full rounded-full" />

          {/* Service tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-1 pb-0.5">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-8 w-24 sm:w-28 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Pricing Freeze Notice */}
        <div className="border-l-2 border-primary/50 bg-muted/20 pl-3.5 p-3 rounded-r-xl space-y-1">
          <div className="flex items-center gap-2">
            <Skeleton className="size-4 rounded-full" />
            <Skeleton className="h-4 w-48 rounded-md" />
          </div>
          <Skeleton className="h-3.5 w-3/4 rounded-md" />
        </div>
      </div>

      {/* 3. Toolbar */}
      <div className="py-4 border-b border-border/60 space-y-3.5 font-sans">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <Skeleton className="h-10 sm:h-9 w-full sm:max-w-sm rounded-xl" />
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-10 sm:h-9 w-28 sm:w-32 rounded-xl" />
            <Skeleton className="h-10 sm:h-9 w-24 sm:w-28 rounded-xl" />
            <Skeleton className="h-10 sm:h-9 w-28 rounded-lg" />
          </div>
        </div>
      </div>

      {/* 4. Desktop Table View (>=768px) */}
      <div className="hidden md:block space-y-6 font-sans">
        <div className="rounded-2xl bg-card overflow-hidden shadow-xs font-sans">
          <div className="p-3.5 sm:p-4 bg-muted/40 border-b border-border/60 flex items-center justify-between">
            <Skeleton className="h-5 w-36 rounded-md" />
            <Skeleton className="h-4 w-24 rounded-md" />
          </div>
          <div className="divide-y divide-border/60">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-3.5 sm:p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="size-4 rounded-md" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-3 w-20 rounded-md" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-20 rounded-lg" />
                  <Skeleton className="h-9 w-20 rounded-lg" />
                  <Skeleton className="h-9 w-20 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4b. Mobile Card Accordion View (<768px) */}
      <div className="md:hidden space-y-3 font-sans">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-card border border-border/70 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
              <Skeleton className="size-8 rounded-lg" />
            </div>
            <div className="pt-2 border-t border-border/60 flex items-center justify-between">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
