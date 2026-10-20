/**
 * Skeleton placeholder matching the NotificationsView layout.
 */
export function NotificationsSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement de vos notifications"
      className="w-full max-w-4xl mx-auto flex-1 flex flex-col space-y-4 animate-pulse"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="h-7 w-48 bg-slate-200 rounded-lg" />
            <div className="h-5 w-8 bg-brand-100 rounded-full" />
          </div>
          <div className="h-4 w-64 bg-slate-100 rounded" />
        </div>
        <div className="h-9 w-36 bg-slate-100 rounded-xl" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 pb-2">
        <div className="h-9 w-24 rounded-full bg-slate-200" />
        <div className="h-9 w-28 rounded-full bg-slate-100" />
      </div>

      {/* Notifications list */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-2xs flex items-start gap-4"
          >
            <div className="size-10 rounded-xl bg-slate-100 shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <div className="flex justify-between items-start">
                <div className="h-4 w-44 bg-slate-200 rounded" />
                <div className="h-3 w-16 bg-slate-100 rounded" />
              </div>
              <div className="h-3.5 w-full max-w-md bg-slate-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
