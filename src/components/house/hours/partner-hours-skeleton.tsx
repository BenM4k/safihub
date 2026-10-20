/**
 * Skeleton placeholder matching the partner opening hours & closures page (/partner/[houseSlug]/hours).
 */
export function PartnerHoursSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement des horaires d'ouverture et fermetures"
      className="space-y-6 max-w-6xl animate-pulse"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-2">
          <div className="h-7 w-60 bg-surface rounded-lg" />
          <div className="h-4 w-80 bg-surface rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-36 bg-surface rounded-xl" />
          <div className="h-10 w-36 bg-surface rounded-xl" />
        </div>
      </div>

      {/* Weekly schedule card */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-4 shadow-2xs">
        <div className="h-5 w-44 bg-surface rounded" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
            >
              <div className="h-4 w-24 bg-surface rounded" />
              <div className="flex gap-3 items-center">
                <div className="h-9 w-28 bg-surface rounded-lg" />
                <div className="h-9 w-28 bg-surface rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exceptional closures card */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-4 shadow-2xs">
        <div className="h-5 w-52 bg-surface rounded" />
        <div className="h-14 bg-surface rounded-xl" />
      </div>
    </div>
  );
}
