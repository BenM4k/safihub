/**
 * Skeleton placeholder matching the manual order entry page (/admin/orders/new).
 */
export function ManualOrderSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement du formulaire de commande manuelle"
      className="space-y-6 animate-pulse"
    >
      <div className="space-y-1.5">
        <div className="h-7 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="h-4 w-96 bg-slate-100 dark:bg-slate-800 rounded" />
      </div>

      <div className="p-6 rounded-2xl bg-card border-2 border-border-strong space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="h-3.5 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
            <div className="h-11 w-full bg-slate-50 dark:bg-slate-800 rounded-xl border border-border" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3.5 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
            <div className="h-11 w-full bg-slate-50 dark:bg-slate-800 rounded-xl border border-border" />
          </div>
        </div>

        <div className="space-y-3 pt-3 border-t border-border">
          <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-28 bg-slate-50 dark:bg-slate-800 rounded-xl border border-border" />
        </div>

        <div className="h-11 w-44 bg-brand-200 rounded-xl mt-4" />
      </div>
    </div>
  );
}
