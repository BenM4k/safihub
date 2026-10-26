import { Skeleton } from "@/components/ui/skeleton";

interface AdminSettingsSkeletonProps {
  label?: string;
}

export function AdminSettingsSkeleton({ label }: AdminSettingsSkeletonProps) {
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
      <div className="border-b border-border pb-5 flex flex-col gap-1.5">
        <Skeleton className="h-7 w-64 rounded-lg" />
        <Skeleton className="h-4 w-80 rounded" />
      </div>

      {/* 2-column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Platform Settings Form */}
        <div className="p-6 bg-card rounded-xl border border-border shadow-2xs flex flex-col gap-5">
          <Skeleton className="h-5 w-44 rounded" />
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-36 rounded" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <Skeleton className="h-9 w-32 rounded-lg" />
          </div>
        </div>

        {/* Right: Exchange Rate Form & Rates History */}
        <div className="flex flex-col gap-6">
          <div className="p-6 bg-card rounded-xl border border-border shadow-2xs flex flex-col gap-4">
            <Skeleton className="h-5 w-40 rounded" />
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-32 rounded" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
              <div className="flex justify-end pt-1">
                <Skeleton className="h-9 w-28 rounded-lg" />
              </div>
            </div>
          </div>

          <div className="p-6 bg-card rounded-xl border border-border shadow-2xs flex flex-col gap-4">
            <Skeleton className="h-5 w-48 rounded" />
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-10 bg-muted/40 rounded-lg px-3 flex items-center justify-between"
                >
                  <Skeleton className="h-3 w-28 rounded" />
                  <Skeleton className="h-3 w-20 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Data Export Card */}
      <div className="p-6 bg-card rounded-xl border border-border shadow-2xs flex flex-col gap-4">
        <Skeleton className="h-5 w-44 rounded" />
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-9 w-36 rounded-lg" />
          <Skeleton className="h-9 w-36 rounded-lg" />
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

