export function UsersLoadingSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-card rounded-2xl border-2 border-border-strong" />
      <div className="bg-card rounded-2xl border-2 border-border-strong overflow-hidden">
        <div className="h-11 bg-surface border-b-2 border-border-strong" />
        <div className="divide-y-2 divide-border-strong/70">
          {Array.from({ length: rows }).map((_, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-1/4">
                <div className="size-9 rounded-full bg-border-strong shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 bg-border-strong rounded w-3/4" />
                  <div className="h-2.5 bg-border-strong/70 rounded w-1/2" />
                </div>
              </div>
              <div className="h-3.5 bg-border-strong rounded w-1/6" />
              <div className="h-3.5 bg-border-strong rounded w-1/6" />
              <div className="h-5 bg-border-strong rounded-full w-20" />
              <div className="h-3.5 bg-border-strong rounded w-1/8" />
              <div className="h-3.5 bg-border-strong rounded w-1/8" />
              <div className="h-5 bg-border-strong rounded-full w-16" />
              <div className="size-8 rounded-lg bg-border-strong shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
