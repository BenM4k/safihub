/**
 * Skeleton placeholder matching the partner order detail view (/partner/[houseSlug]/orders/[id]).
 */
export function PartnerOrderDetailSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement des détails de la commande"
      className="space-y-6 max-w-4xl mx-auto animate-pulse"
    >
      {/* Back link */}
      <div className="h-4 w-36 bg-surface rounded" />

      {/* Order Header Card */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div className="space-y-1.5">
            <div className="h-6 w-44 bg-surface rounded" />
            <div className="h-4 w-32 bg-surface rounded" />
          </div>
          <div className="h-7 w-28 bg-surface rounded-full" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 w-16 bg-surface rounded" />
              <div className="h-4 w-24 bg-surface rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Items list card */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-4 shadow-2xs">
        <div className="h-5 w-40 bg-surface rounded" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-0">
              <div className="space-y-1">
                <div className="h-4 w-32 bg-surface rounded" />
                <div className="h-3 w-20 bg-surface rounded" />
              </div>
              <div className="h-4 w-16 bg-surface rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
