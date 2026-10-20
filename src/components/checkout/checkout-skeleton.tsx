/**
 * Skeleton placeholder matching the CheckoutForm layout (address picker, slot picker, order summary).
 */
export function CheckoutSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement de la commande"
      className="max-w-4xl mx-auto w-full space-y-8 animate-pulse"
    >
      {/* Title */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-slate-200 rounded-lg" />
        <div className="h-4 w-80 bg-slate-100 rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Steps */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Address Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
            <div className="h-5 w-48 bg-slate-200 rounded" />
            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <div className="h-3.5 w-20 bg-slate-100 rounded" />
                <div className="h-11 w-full bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <div className="h-3.5 w-24 bg-slate-100 rounded" />
                <div className="h-11 w-full bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-11 bg-slate-50 border border-slate-200 rounded-xl" />
                <div className="h-11 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
            </div>
          </div>

          {/* Step 2: Slot Picker Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
            <div className="h-5 w-40 bg-slate-200 rounded" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-slate-100 border border-slate-200/60" />
              ))}
            </div>
          </div>

          {/* Step 3: Cash notice */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-3">
            <div className="size-5 rounded-full bg-amber-500/20 shrink-0" />
            <div className="h-4 w-4/5 bg-amber-500/20 rounded" />
          </div>
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-5 sticky top-24">
          <div className="h-5 w-32 bg-slate-200 rounded" />
          <div className="space-y-3 pt-1">
            <div className="flex justify-between">
              <div className="h-4 w-20 bg-slate-100 rounded" />
              <div className="h-4 w-24 bg-slate-200 rounded" />
            </div>
            <div className="flex justify-between">
              <div className="h-4 w-28 bg-slate-100 rounded" />
              <div className="h-4 w-20 bg-slate-100 rounded" />
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <div className="h-5 w-16 bg-slate-200 rounded" />
              <div className="h-6 w-32 bg-brand-200 rounded-lg" />
            </div>
          </div>
          <div className="h-12 w-full bg-brand-300 rounded-full mt-4" />
        </div>
      </div>
    </div>
  );
}
