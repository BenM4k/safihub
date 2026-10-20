/**
 * Skeleton placeholder matching the customer account page (/account).
 */
export function AccountSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement de vos informations de compte"
      className="max-w-4xl mx-auto w-full space-y-8 animate-pulse"
    >
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-44 bg-slate-200 rounded-lg" />
        <div className="h-4 w-72 bg-slate-100 rounded" />
      </div>

      {/* 2-column grid: Profile + Addresses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="h-5 w-36 bg-slate-200 rounded" />
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <div className="h-3.5 w-16 bg-slate-100 rounded" />
              <div className="h-11 w-full bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3.5 w-24 bg-slate-100 rounded" />
              <div className="h-11 w-full bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3.5 w-20 bg-slate-100 rounded" />
              <div className="h-11 w-full bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div className="h-11 w-32 bg-brand-200 rounded-full mt-4" />
          </div>
        </div>

        {/* Addresses Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-5 w-32 bg-slate-200 rounded" />
            <div className="h-8 w-24 bg-slate-100 rounded-xl" />
          </div>
          <div className="space-y-3 pt-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2"
              >
                <div className="h-4 w-28 bg-slate-200 rounded" />
                <div className="h-3 w-40 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Consents History Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
        <div className="h-5 w-48 bg-slate-200 rounded" />
        <div className="h-20 w-full bg-slate-50 border border-slate-100 rounded-2xl" />
      </div>
    </div>
  );
}
