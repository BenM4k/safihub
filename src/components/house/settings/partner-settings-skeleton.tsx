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
      className="space-y-6 max-w-6xl mx-auto pb-16"
    >
      {/* Header */}
      <div className="space-y-2 pb-4 border-b border-border">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-4 w-96 rounded-md" />
      </div>

      {/* Tabs navigation */}
      <div className="flex gap-4 border-b border-border/60 pb-2">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-28 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-28 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>

      {/* Settings Form Flat Section */}
      <div className="space-y-6 pt-2">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48 rounded-md" />
          <Skeleton className="h-4 w-80 rounded-md" />
        </div>

        <div className="space-y-4 max-w-xl">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-40 rounded-md" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <Skeleton className="h-10 w-36 rounded-lg mt-2" />
        </div>
      </div>
    </div>
  );
}
