import { Suspense } from "react";
import { redirectIfAuthenticated } from "@/services/auth";

async function RedirectWhenAuthenticated() {
  await redirectIfAuthenticated();
  return null;
}

/**
 * Defers the guest-only auth check inside a Suspense boundary so that
 * auth routes (/login, /register, /sign-up, /forgot-password) can prerender
 * their shell while still redirecting authenticated users at request time.
 */
export function AuthRedirectGate() {
  return (
    <Suspense fallback={null}>
      <RedirectWhenAuthenticated />
    </Suspense>
  );
}

