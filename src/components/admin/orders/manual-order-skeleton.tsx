import { Skeleton } from "@/components/ui/skeleton";

interface ManualOrderSkeletonProps {
  label?: string;
}

export function ManualOrderSkeleton({ label }: ManualOrderSkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      className="flex flex-col gap-6 font-sans"
    >
      {label && <span className="sr-only">{label}</span>}
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-7 w-64 rounded-lg" />
        <Skeleton className="h-4 w-96 rounded" />
      </div>

      <div className="p-6 rounded-2xl bg-card border border-border flex flex-col gap-5 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-24 rounded" />
            <Skeleton className="h-11 w-full rounded-xl border border-border" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-32 rounded" />
            <Skeleton className="h-11 w-full rounded-xl border border-border" />
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-3 border-t border-border">
          <Skeleton className="h-4 w-40 rounded" />
          <Skeleton className="h-28 w-full rounded-xl border border-border" />
        </div>

        <Skeleton className="h-11 w-44 rounded-xl mt-4" />
      </div>
    </div>
  );
}

