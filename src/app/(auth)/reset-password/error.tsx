"use client";

import { AuthErrorCard } from "@/components/auth/auth-error-card";

interface ResetPasswordErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ResetPasswordError({
  error,
  reset,
}: ResetPasswordErrorProps) {
  return <AuthErrorCard error={error} reset={reset} showBackToLogin={true} />;
}
