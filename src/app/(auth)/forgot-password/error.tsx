"use client";

import { AuthErrorCard } from "@/components/auth/auth-error-card";

interface ForgotPasswordErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ForgotPasswordError({
  error,
  reset,
}: ForgotPasswordErrorProps) {
  return <AuthErrorCard error={error} reset={reset} showBackToLogin={true} />;
}
