"use client";

import { AuthErrorCard } from "@/components/auth/auth-error-card";

interface SignUpErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SignUpError({ error, reset }: SignUpErrorProps) {
  return <AuthErrorCard error={error} reset={reset} showBackToLogin={true} />;
}
