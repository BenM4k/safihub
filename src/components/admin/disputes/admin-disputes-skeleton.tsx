import { Skeleton } from "@/components/ui/skeleton";

interface AdminDisputesSkeletonProps {
  label?: string;
}

export function AdminDisputesSkeleton({ label }: AdminDisputesSkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      className="flex flex-col gap-6 font-sans"
    >
      {label && <span className="sr-only">{label}</span>}
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-7 w-56 rounded-lg" />
        <Skeleton className="h-4 w-72 rounded" />
      </div>

      {/* Disputes List Skeleton */}
      <div className="grid grid-cols-1 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-card rounded-2xl border border-border p-5 shadow-2xs flex flex-col gap-3"
          >
            {/* Top row: Badges and date */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-md" />
              </div>
              <Skeleton className="h-4 w-24 rounded" />
            </div>

            {/* Description box */}
            <Skeleton className="h-16 w-full rounded-xl border border-border" />

            {/* Bottom link */}
            <div className="pt-1">
              <Skeleton className="h-4 w-36 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

