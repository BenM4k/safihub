import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton placeholder matching the exact layout and dimensions of LoginForm.
 */
export function LoginSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="w-full max-w-sm sm:max-w-md mx-auto"
    >
      {/* Header */}
      <div className="text-left mb-6 flex flex-col gap-2">
        <Skeleton className="h-8 w-56 rounded-lg" />
        <Skeleton className="h-4 w-72 rounded-md" />
      </div>

      {/* Form Fields */}
      <div className="flex flex-col gap-4">
        {/* Email field */}
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>

        {/* Password field */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-3.5 w-32 rounded" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>

        {/* Submit button */}
        <div className="pt-2">
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>

      {/* Switch link */}
      <div className="mt-8 flex justify-center">
        <Skeleton className="h-4 w-48 rounded" />
      </div>
    </div>
  );
}
