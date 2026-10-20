/**
 * Skeleton placeholder matching the exact layout and dimensions of RegisterForm.
 */
export function RegisterSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement du formulaire d'inscription"
      className="w-full max-w-sm sm:max-w-md mx-auto animate-pulse"
    >
      {/* Header */}
      <div className="text-left mb-6 space-y-2">
        <div className="h-8 w-64 bg-ink-200 dark:bg-ink-800 rounded-lg" />
        <div className="h-4 w-72 bg-ink-100 dark:bg-ink-800/60 rounded-md" />

        {/* Step dots */}
        <div className="flex items-center gap-2 pt-2">
          <span className="size-2 rounded-full bg-primary" />
          <span className="size-1.5 rounded-full bg-ink-200 dark:bg-ink-800" />
          <span className="size-1.5 rounded-full bg-ink-200 dark:bg-ink-800" />
          <span className="size-1.5 rounded-full bg-ink-200 dark:bg-ink-800" />
          <span className="size-1.5 rounded-full bg-ink-200 dark:bg-ink-800" />
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Name Fields (2 cols) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <div className="h-4 w-16 bg-ink-200 dark:bg-ink-800 rounded" />
            <div className="h-12 w-full bg-ink-50 dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <div className="h-4 w-16 bg-ink-200 dark:bg-ink-800 rounded" />
            <div className="h-12 w-full bg-ink-50 dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-xl" />
          </div>
        </div>

        {/* Contact Fields (2 cols) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <div className="h-4 w-24 bg-ink-200 dark:bg-ink-800 rounded" />
            <div className="h-12 w-full bg-ink-50 dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <div className="h-4 w-20 bg-ink-200 dark:bg-ink-800 rounded" />
            <div className="h-12 w-full bg-ink-50 dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-xl" />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="h-4 w-24 bg-ink-200 dark:bg-ink-800 rounded" />
          <div className="h-12 w-full bg-ink-50 dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-xl" />
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <div className="h-4 w-36 bg-ink-200 dark:bg-ink-800 rounded" />
          <div className="h-12 w-full bg-ink-50 dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-xl" />
        </div>

        {/* Consent Checkboxes */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-start gap-2.5">
            <div className="size-4.5 rounded bg-ink-200 dark:bg-ink-800 shrink-0 mt-0.5" />
            <div className="h-4 w-60 bg-ink-100 dark:bg-ink-800/60 rounded" />
          </div>
          <div className="flex items-start gap-2.5">
            <div className="size-4.5 rounded bg-ink-200 dark:bg-ink-800 shrink-0 mt-0.5" />
            <div className="h-4 w-64 bg-ink-100 dark:bg-ink-800/60 rounded" />
          </div>
        </div>

        {/* Submit button */}
        <div className="pt-2">
          <div className="h-12 w-full bg-brand-200 dark:bg-brand-900/60 rounded-full" />
        </div>
      </div>

      {/* Switch link */}
      <div className="mt-8 flex justify-center">
        <div className="h-4 w-48 bg-ink-100 dark:bg-ink-800/60 rounded" />
      </div>
    </div>
  );
}
