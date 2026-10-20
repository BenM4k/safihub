"use client";

import { AuthErrorCard } from "@/components/auth/auth-error-card";

interface LoginErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LoginError({ error, reset }: LoginErrorProps) {
  return <AuthErrorCard error={error} reset={reset} showBackToLogin={false} />;
}
