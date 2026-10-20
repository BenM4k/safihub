/**
 * Loading skeleton matching the typography, navigation tabs, and multi-section
 * layout of SafiHub legal documentation pages (/terms, /privacy, /security, /consent).
 */
export function LegalPageSkeleton({ activeTabLabel = "Document Légal" }: { activeTabLabel?: string }) {
  return (
    <article
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={`Chargement : ${activeTabLabel}`}
      className="space-y-16 sm:space-y-24 lg:space-y-28 animate-pulse"
    >
      {/* Header Skeleton */}
      <header className="text-center pt-8 sm:pt-12 pb-6">
        {/* Badge */}
        <div className="flex justify-center mb-4">
          <div className="h-6 w-44 rounded-full bg-slate-100 border border-slate-200" />
        </div>

        {/* Title */}
        <div className="h-10 sm:h-14 w-3/4 max-w-xl bg-slate-200 rounded-2xl mx-auto mt-4" />

        {/* Last updated */}
        <div className="h-4 w-52 bg-slate-100 rounded-md mx-auto mt-3" />

        {/* Description */}
        <div className="space-y-2 max-w-2xl mx-auto mt-4">
          <div className="h-4 w-full bg-slate-100 rounded" />
          <div className="h-4 w-4/5 mx-auto bg-slate-100 rounded" />
        </div>

        {/* Nav Tabs Skeleton */}
        <div className="mt-8 sm:mt-10 flex justify-center">
          <div className="h-11 w-full max-w-xl rounded-full bg-slate-100/90 border border-slate-200 p-1 flex items-center justify-between gap-1">
            <div className="h-9 w-1/4 rounded-full bg-slate-200" />
            <div className="h-9 w-1/4 rounded-full bg-slate-150" />
            <div className="h-9 w-1/4 rounded-full bg-slate-150" />
            <div className="h-9 w-1/4 rounded-full bg-slate-150" />
          </div>
        </div>

        <hr className="border-slate-200/80 mt-12 sm:mt-16 mb-16 sm:mb-24" />
      </header>

      {/* Section 1 Skeleton */}
      <section className="space-y-4">
        <div className="h-8 w-64 bg-slate-200 rounded-lg mb-6" />
        <div className="space-y-2.5">
          <div className="h-4 w-full bg-slate-100 rounded" />
          <div className="h-4 w-11/12 bg-slate-100 rounded" />
          <div className="h-4 w-4/5 bg-slate-100 rounded" />
        </div>

        <div className="mt-6 p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="h-4 w-40 bg-slate-200 rounded" />
          <div className="h-3.5 w-full bg-slate-100 rounded" />
          <div className="h-3.5 w-3/4 bg-slate-100 rounded" />
        </div>
      </section>

      {/* Section 2 Skeleton */}
      <section className="space-y-4">
        <div className="h-8 w-72 bg-slate-200 rounded-lg mb-6" />
        <div className="space-y-2.5">
          <div className="h-4 w-full bg-slate-100 rounded" />
          <div className="h-4 w-10/12 bg-slate-100 rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="size-8 rounded-lg bg-slate-200 mb-2" />
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="h-3.5 w-full bg-slate-100 rounded" />
          </div>
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="size-8 rounded-lg bg-slate-200 mb-2" />
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="h-3.5 w-full bg-slate-100 rounded" />
          </div>
        </div>
      </section>
    </article>
  );
}
