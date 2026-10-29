import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton placeholder matching the partner settings view (/partner/[houseSlug]/settings).
 */
export function PartnerSettingsSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement des paramètres de votre atelier"
      className="space-y-6 sm:space-y-8 max-w-6xl mx-auto pb-24 sm:pb-28 font-sans"
    >
      {/* 1. Header */}
      <div className="pb-5 border-b border-border/60 font-sans space-y-1.5">
        <Skeleton className="h-8 sm:h-9 w-48 sm:w-60 rounded-lg" />
        <Skeleton className="h-4 w-64 sm:w-80 rounded-md" />
      </div>

      {/* 2. Desktop Navigation Tabs (>=768px) */}
      <div className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-muted/30 overflow-x-auto scrollbar-none font-sans">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-lg shrink-0" />
        ))}
      </div>

      {/* 2b. Mobile Navigation List (<768px) */}
      <div className="md:hidden divide-y divide-border/60 rounded-2xl bg-card shadow-xs overflow-hidden font-sans">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-lg shrink-0" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-3 w-44 rounded-md" />
              </div>
            </div>
            <Skeleton className="size-4 rounded-md shrink-0" />
          </div>
        ))}
      </div>

      {/* 3. Section Cards (Commandes default view) */}
      <div className="hidden md:block space-y-6 font-sans">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl bg-card shadow-xs p-5 space-y-4 font-sans"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-5 w-36 rounded-md" />
                <Skeleton className="h-3.5 w-60 rounded-md" />
              </div>
              <Skeleton className="h-9 w-24 rounded-lg" />
            </div>
            <div className="space-y-2 pt-2">
              <Skeleton className="h-10 w-full sm:max-w-md rounded-lg" />
              <Skeleton className="h-3.5 w-48 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
