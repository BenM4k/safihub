/**
 * Skeleton placeholder matching the partner settings view (/partner/[houseSlug]/settings).
 */
export function PartnerSettingsSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement des paramètres de votre atelier"
      className="space-y-6 max-w-5xl animate-pulse"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1.5">
          <div className="h-7 w-48 bg-surface rounded-lg" />
          <div className="h-4 w-72 bg-surface rounded" />
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex gap-2 border-b border-border pb-2">
        <div className="h-9 w-28 bg-surface rounded-xl" />
        <div className="h-9 w-32 bg-surface rounded-xl" />
        <div className="h-9 w-28 bg-surface rounded-xl" />
        <div className="h-9 w-32 bg-surface rounded-xl" />
      </div>

      {/* Settings Form Card */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-4 shadow-2xs">
        <div className="h-5 w-40 bg-surface rounded" />
        <div className="space-y-3 pt-2">
          <div className="space-y-1.5">
            <div className="h-3.5 w-24 bg-surface rounded" />
            <div className="h-11 w-full bg-surface rounded-xl border border-border" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3.5 w-32 bg-surface rounded" />
            <div className="h-11 w-full bg-surface rounded-xl border border-border" />
          </div>
        </div>
        <div className="h-11 w-32 bg-surface rounded-xl mt-4" />
      </div>
    </div>
  );
}
