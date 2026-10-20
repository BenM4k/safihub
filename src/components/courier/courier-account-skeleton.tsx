/**
 * Skeleton placeholder matching the courier account page (/courier/account).
 */
export function CourierAccountSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement de votre compte coursier"
      className="space-y-5 pb-6 animate-pulse"
    >
      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center gap-3.5">
          <div className="size-12 rounded-2xl bg-slate-200" />
          <div className="space-y-1.5">
            <div className="h-5 w-36 bg-slate-200 rounded" />
            <div className="h-4 w-28 bg-emerald-100 rounded-full" />
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="h-3.5 w-48 bg-slate-100 rounded" />
          <div className="h-3.5 w-36 bg-slate-100 rounded" />
          <div className="h-3.5 w-32 bg-slate-100 rounded" />
        </div>
      </div>

      {/* Shortcuts Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
        <div className="h-3 w-28 bg-slate-200 rounded" />
        <div className="space-y-2 pt-1">
          <div className="h-11 w-full bg-slate-50 rounded-xl" />
          <div className="h-11 w-full bg-slate-50 rounded-xl" />
        </div>
      </div>

      {/* Logout button */}
      <div className="pt-2">
        <div className="h-11 w-full bg-rose-50 border border-rose-200 rounded-xl" />
      </div>
    </div>
  );
}
