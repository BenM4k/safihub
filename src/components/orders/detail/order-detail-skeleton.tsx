/**
 * Skeleton placeholder matching the order detail page (/orders/[orderId]) and public tracking page (/track/[token]).
 */
export function OrderDetailSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement des détails de la commande"
      className="max-w-5xl mx-auto w-full flex-1 flex flex-col space-y-6 animate-pulse"
    >
      {/* Top navigation row */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-36 bg-muted rounded" />
        <div className="h-4 w-28 bg-muted rounded" />
      </div>

      {/* Code badge */}
      <div className="h-16 w-full rounded-2xl bg-primary/10 border border-primary/20 p-4 flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-3 w-32 bg-primary/20 rounded" />
          <div className="h-5 w-24 bg-primary/30 rounded" />
        </div>
        <div className="h-8 w-20 bg-primary/20 rounded-lg" />
      </div>

      {/* Order Header Card */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-44 bg-muted rounded-lg" />
          <div className="h-4 w-32 bg-muted/60 rounded" />
          <div className="h-3.5 w-52 bg-muted/60 rounded" />
        </div>
        <div className="h-8 w-32 rounded-full bg-muted" />
      </div>

      {/* Main Grid: Items & Photos on Left, Timeline on Right */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Column (col-span-2) */}
        <div className="md:col-span-2 space-y-6">
          {/* Items Card */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="h-5 w-36 bg-muted rounded" />
            <div className="divide-y divide-border">
              {[1, 2, 3].map((i) => (
                <div key={i} className="py-3 flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="h-3 w-20 bg-muted/60 rounded" />
                  </div>
                  <div className="h-4 w-20 bg-primary/20 rounded" />
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-border flex justify-between items-center">
              <div className="h-5 w-24 bg-muted rounded" />
              <div className="h-6 w-32 bg-primary/20 rounded-lg" />
            </div>
          </div>

          {/* Photos Gallery */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="h-5 w-40 bg-muted rounded" />
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-square rounded-2xl bg-muted" />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Timeline (col-span-1) */}
        <div className="md:col-span-1 rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="h-5 w-32 bg-muted rounded" />
          <div className="space-y-6 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="size-6 rounded-full bg-muted shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-28 bg-muted rounded" />
                  <div className="h-3 w-36 bg-muted/60 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
