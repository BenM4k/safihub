/**
 * Skeleton placeholder matching the partner catalogue page (/partner/[houseSlug]/catalogue).
 */
export function PartnerCatalogueSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement de votre catalogue et de vos tarifs"
      className="space-y-6 animate-pulse"
    >
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="h-7 w-48 bg-surface rounded-lg" />
          <div className="h-4 w-72 bg-surface rounded-lg" />
        </div>
        <div className="h-10 w-44 bg-surface rounded-xl" />
      </div>

      {/* Toolbar Skeleton */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="h-10 w-full sm:max-w-xs bg-surface rounded-xl border border-border" />
        <div className="flex gap-2">
          <div className="h-10 w-28 bg-surface rounded-xl border border-border" />
          <div className="h-10 w-28 bg-surface rounded-xl border border-border" />
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
                <div className="h-4 w-32 bg-surface rounded" />
                <div className="h-3 w-20 bg-surface rounded" />
              </div>
              <div className="h-6 w-12 bg-surface rounded-full" />
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex justify-between items-center">
                <div className="h-3.5 w-20 bg-surface rounded" />
                <div className="h-5 w-24 bg-surface rounded" />
              </div>
              <div className="flex justify-between items-center">
                <div className="h-3.5 w-24 bg-surface rounded" />
                <div className="h-4 w-16 bg-surface rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
