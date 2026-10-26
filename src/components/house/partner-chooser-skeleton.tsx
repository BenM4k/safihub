import { Skeleton } from "@/components/ui/skeleton";

interface PartnerChooserSkeletonProps {
  label?: string;
}

/**
 * Skeleton placeholder matching the partner chooser page (/partner).
 */
export function PartnerChooserSkeleton({
  label = "Chargement de vos ateliers",
}: PartnerChooserSkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      className="min-h-screen bg-background py-12 px-4 sm:px-6"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <Skeleton className="size-12 rounded-2xl mx-auto" />
          <Skeleton className="h-7 w-56 rounded-lg mx-auto" />
          <Skeleton className="h-4 w-72 rounded mx-auto" />
        </div>

        {/* Houses List */}
        <div className="grid gap-3 pt-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-card border border-border flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <Skeleton className="size-10 rounded-xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36 rounded" />
                  <Skeleton className="h-3 w-24 rounded" />
                </div>
              </div>
              <Skeleton className="size-4 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
