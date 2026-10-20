/**
 * Skeleton placeholder matching the exact layout and dimensions of LoginForm.
 */
export function LoginSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement de la page de connexion"
      className="w-full max-w-sm sm:max-w-md mx-auto animate-pulse"
    >
      {/* Header */}
      <div className="text-left mb-6 space-y-2">
        <div className="h-8 w-56 bg-ink-200 dark:bg-ink-800 rounded-lg" />
        <div className="h-4 w-72 bg-ink-100 dark:bg-ink-800/60 rounded-md" />
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Email field */}
        <div className="space-y-1.5">
          <div className="h-4 w-24 bg-ink-200 dark:bg-ink-800 rounded" />
          <div className="h-12 w-full bg-ink-50 dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-xl" />
        </div>

        {/* Password field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 bg-ink-200 dark:bg-ink-800 rounded" />
            <div className="h-3.5 w-32 bg-ink-100 dark:bg-ink-800/60 rounded" />
          </div>
          <div className="h-12 w-full bg-ink-50 dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-xl" />
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
