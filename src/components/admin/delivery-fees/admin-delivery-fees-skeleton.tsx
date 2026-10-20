/**
 * Skeleton placeholder matching the Admin Delivery Fees page (/admin/delivery-fees).
 */
export function AdminDeliveryFeesSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement de la grille des frais de livraison"
      className="space-y-6 font-sans animate-pulse"
    >
      {/* Header */}
      <div className="space-y-1.5">
        <div className="h-7 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="h-4 w-80 bg-slate-100 dark:bg-slate-800 rounded" />
      </div>

      {/* Fee Pair Form Skeleton */}
      <div className="p-5 bg-card rounded-xl border border-border shadow-xs space-y-4">
        <div className="h-4 w-44 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-9 w-full bg-slate-100 dark:bg-slate-800 rounded-md" />
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-1">
          <div className="h-9 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        </div>
      </div>

      {/* Fee Matrix Table Skeleton */}
      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
        </div>
        <div className="h-10 bg-slate-50 dark:bg-slate-800 border-b border-border flex items-center px-4" />
        <div className="divide-y divide-border">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-14 px-4 flex items-center justify-between gap-4">
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-8 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
