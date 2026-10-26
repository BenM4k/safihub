import { Skeleton } from "@/components/ui/skeleton";

interface AdminCourierDetailSkeletonProps {
  label?: string;
}

export function AdminCourierDetailSkeleton({ label }: AdminCourierDetailSkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      className="flex flex-col gap-6 font-sans"
    >
      {label && <span className="sr-only">{label}</span>}
      {/* Top Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-3 w-3 rounded" />
          <Skeleton className="h-3 w-28 rounded" />
        </div>
        <Skeleton className="h-8 w-60 rounded-lg" />
        <Skeleton className="h-4 w-48 rounded" />
      </div>

      {/* Tabs list skeleton */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-28 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>

      {/* Profile Form Card Skeleton */}
      <div className="p-5 bg-card rounded-xl border border-border shadow-2xs flex flex-col gap-5">
        <Skeleton className="h-4 w-32 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-2">
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

