/**
 * Skeleton placeholder matching the 2-column cart layout (items list + summary card).
 */
export function CartSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement du panier"
      className="w-full max-w-6xl mx-auto py-8 sm:py-10 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col animate-pulse"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-5 mb-6">
        <div className="space-y-2">
          <div className="h-8 w-44 bg-muted rounded-lg" />
          <div className="h-4 w-64 bg-muted/60 rounded" />
        </div>
        <div className="h-9 w-28 bg-muted rounded-xl" />
      </div>

      {/* Main Grid: Items + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left: Items list */}
        <div className="lg:col-span-8 space-y-3.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-4 sm:p-5 flex items-center justify-between gap-4 shadow-2xs"
            >
              <div className="flex items-center gap-3.5">
                <div className="size-14 rounded-xl bg-muted shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-4 w-36 bg-muted rounded" />
                  <div className="h-3 w-24 bg-muted/60 rounded" />
                  <div className="h-4 w-28 bg-primary/20 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-24 bg-muted rounded-xl" />
                <div className="size-9 bg-muted rounded-xl" />
              </div>
            </div>
          ))}
        </div>

        {/* Right: Order Summary card */}
        <div className="lg:col-span-4 rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="h-6 w-32 bg-muted rounded-md pb-2 border-b border-border" />
          <div className="space-y-3 pt-2">
            <div className="flex justify-between">
              <div className="h-4 w-20 bg-muted/60 rounded" />
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
            <div className="flex justify-between">
              <div className="h-4 w-28 bg-muted/60 rounded" />
              <div className="h-4 w-20 bg-muted rounded" />
            </div>
            <div className="pt-3 border-t border-border flex justify-between items-center">
              <div className="h-5 w-16 bg-muted rounded" />
              <div className="h-6 w-32 bg-primary/30 rounded-lg" />
            </div>
          </div>
          <div className="h-12 w-full bg-primary/40 rounded-full mt-4" />
        </div>
      </div>
    </div>
  );
}
