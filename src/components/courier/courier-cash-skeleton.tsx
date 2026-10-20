/**
 * Skeleton placeholder matching the courier cash management page (/courier/cash).
 */
export function CourierCashSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement de votre caisse et de vos plafonds"
      className="space-y-4 pb-20 animate-pulse"
    >
      {/* Cash Held Card */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-3.5 w-28 bg-slate-200 rounded" />
          <div className="size-9 rounded-xl bg-slate-100" />
        </div>

        <div className="space-y-1">
          <div className="h-8 w-44 bg-slate-200 rounded-lg" />
        </div>

        {/* Progress bar placeholder */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex justify-between">
            <div className="h-3 w-20 bg-slate-100 rounded" />
            <div className="h-3 w-16 bg-slate-100 rounded" />
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full" />
        </div>

        {/* Deposit and float pills */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="h-3 w-16 bg-slate-100 rounded" />
            <div className="h-4 w-20 bg-slate-200 rounded" />
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="h-3 w-20 bg-slate-100 rounded" />
            <div className="h-4 w-20 bg-slate-200 rounded" />
          </div>
        </div>
      </div>

      {/* Breakdown Card */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="h-4 w-44 bg-slate-200 rounded" />
        <div className="space-y-2 pt-1">
          <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
            <div className="h-3.5 w-36 bg-slate-100 rounded" />
            <div className="h-4 w-20 bg-slate-200 rounded" />
          </div>
          <div className="flex justify-between items-center py-1.5">
            <div className="h-3.5 w-32 bg-slate-100 rounded" />
            <div className="h-4 w-20 bg-slate-200 rounded" />
          </div>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="h-4 w-36 bg-slate-200 rounded" />
        <div className="space-y-2.5 pt-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
              <div className="space-y-1">
                <div className="h-3.5 w-28 bg-slate-200 rounded" />
                <div className="h-2.5 w-20 bg-slate-100 rounded" />
              </div>
              <div className="h-4 w-20 bg-emerald-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
