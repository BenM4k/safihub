/**
 * Skeleton placeholder matching the partner chooser page (/partner).
 */
export function PartnerChooserSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement de vos ateliers"
      className="min-h-screen bg-surface py-12 px-4 sm:px-6 animate-pulse"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="size-12 rounded-2xl bg-slate-200 mx-auto" />
          <div className="h-7 w-56 bg-slate-200 rounded-lg mx-auto" />
          <div className="h-4 w-72 bg-slate-100 rounded mx-auto" />
        </div>

        {/* Houses List */}
        <div className="grid gap-3 pt-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-card border border-border flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="size-10 rounded-xl bg-slate-100" />
                <div className="space-y-1.5">
                  <div className="h-4 w-36 bg-slate-200 rounded" />
                  <div className="h-3 w-24 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="size-4 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
