"use client";

import { AuthErrorCard } from "@/components/auth/auth-error-card";

interface RegisterErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RegisterError({ error, reset }: RegisterErrorProps) {
  return <AuthErrorCard error={error} reset={reset} showBackToLogin={true} />;
}
