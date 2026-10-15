export function CashLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse font-sans" aria-busy="true" aria-label="Chargement de l'écran de caisse">
      {/* 1. Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-2">
          <div className="h-7 w-80 bg-secondary rounded-lg" />
          <div className="h-4 w-96 max-w-full bg-muted rounded-md" />
        </div>
        <div className="h-10 w-64 bg-surface rounded-xl border border-border" />
      </div>

      {/* 2. KPI Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-xl border border-border bg-card space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-3 w-28 bg-secondary rounded" />
              <div className="size-9 rounded-lg bg-surface border border-border" />
            </div>
            <div className="h-7 w-36 bg-muted rounded" />
            <div className="h-3 w-44 bg-surface rounded" />
          </div>
        ))}
      </div>

      {/* 3. Section Heading & Couriers Table skeleton */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-5 w-48 bg-secondary rounded" />
          <div className="h-4 w-36 bg-muted rounded" />
        </div>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="h-10 bg-surface border-b border-border" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border-b border-border/60 flex items-center justify-between gap-4">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-4 w-20 bg-muted rounded" />
              <div className="h-4 w-20 bg-muted rounded" />
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-8 w-20 bg-secondary rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* 4. History Table skeleton */}
      <div className="space-y-3 pt-2">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <div className="h-5 w-52 bg-secondary rounded" />
            <div className="h-9 w-28 bg-surface rounded-lg border border-border" />
          </div>
          <div className="h-12 bg-surface/50 border-b border-border" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3.5 border-b border-border/60 flex items-center justify-between gap-3">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-4 w-20 bg-muted rounded" />
              <div className="h-4 w-20 bg-muted rounded" />
              <div className="h-4 w-20 bg-muted rounded" />
              <div className="h-6 w-20 bg-surface rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
