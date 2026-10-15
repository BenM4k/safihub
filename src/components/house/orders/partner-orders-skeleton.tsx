export function PartnerOrdersSkeleton() {
  return (
    <div className="space-y-4">
      {/* Skeletons for cards / table */}
      <div className="grid grid-cols-1 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 sm:p-5 rounded-2xl bg-card border border-border space-y-3 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="h-6 w-24 bg-surface rounded-md" />
              <div className="h-6 w-20 bg-surface rounded-full" />
            </div>
            <div className="space-y-1.5">
              <div className="h-4 w-3/4 bg-surface rounded-sm" />
              <div className="h-3 w-1/2 bg-surface rounded-sm" />
            </div>
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <div className="h-5 w-28 bg-surface rounded-md" />
              <div className="h-9 w-24 bg-surface rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
