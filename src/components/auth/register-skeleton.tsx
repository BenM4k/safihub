import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton placeholder matching the exact layout and dimensions of RegisterForm.
 */
export function RegisterSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="w-full max-w-sm sm:max-w-md mx-auto"
    >
      {/* Header */}
      <div className="text-left mb-6 flex flex-col gap-2">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-4 w-72 rounded-md" />

        {/* Step dots */}
        <div className="flex items-center gap-2 pt-2">
          <span className="size-2 rounded-full bg-primary" />
          <Skeleton className="size-1.5 rounded-full" />
          <Skeleton className="size-1.5 rounded-full" />
          <Skeleton className="size-1.5 rounded-full" />
          <Skeleton className="size-1.5 rounded-full" />
        </div>
      </div>

      {/* Form Fields */}
      <div className="flex flex-col gap-4">
        {/* Name Fields (2 cols) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>

        {/* Contact Fields (2 cols) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-36 rounded" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>

        {/* Consent Checkboxes */}
        <div className="flex flex-col gap-2.5 pt-1">
          <div className="flex items-start gap-2.5">
            <Skeleton className="size-4.5 rounded shrink-0 mt-0.5" />
            <Skeleton className="h-4 w-60 rounded" />
          </div>
          <div className="flex items-start gap-2.5">
            <Skeleton className="size-4.5 rounded shrink-0 mt-0.5" />
            <Skeleton className="h-4 w-64 rounded" />
          </div>
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
