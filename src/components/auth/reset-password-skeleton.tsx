/**
 * Skeleton placeholder matching the exact layout and dimensions of ResetPasswordForm.
 */
export function ResetPasswordSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement du formulaire de nouveau mot de passe"
      className="w-full max-w-sm sm:max-w-md mx-auto animate-pulse"
    >
      {/* Header */}
      <div className="text-left mb-6 space-y-2">
        <div className="h-8 w-60 bg-ink-200 rounded-lg" />
        <div className="h-4 w-72 bg-ink-100 rounded-md" />
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* New Password field */}
        <div className="space-y-1.5">
          <div className="h-4 w-36 bg-ink-200 rounded" />
          <div className="h-12 w-full bg-ink-50 border border-ink-200 rounded-xl" />
        </div>

        {/* Confirm Password field */}
        <div className="space-y-1.5">
          <div className="h-4 w-40 bg-ink-200 rounded" />
          <div className="h-12 w-full bg-ink-50 border border-ink-200 rounded-xl" />
        </div>

        {/* Submit button */}
        <div className="pt-2">
          <div className="h-12 w-full bg-brand-200 rounded-full" />
        </div>
      </div>

      {/* Back to login link */}
      <div className="mt-8 flex justify-center">
        <div className="h-4 w-36 bg-ink-100 rounded" />
      </div>
    </div>
  );
}
