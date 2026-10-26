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
      className="space-y-6"
    >
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-48 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-44 rounded-xl" />
      </div>

      {/* Toolbar Skeleton */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-10 w-full sm:max-w-xs rounded-xl" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>

      {/* Catalogue Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-card border border-border space-y-4 shadow-2xs"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex justify-between items-center">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="flex justify-between items-center">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
