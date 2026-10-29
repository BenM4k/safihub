import { Suspense } from "react";
import { getCurrentUser } from "@/services/auth";
import { Navbar } from "./navbar";
import type { AuthenticatedUser } from "@/services/auth/guards";

interface SessionNavbarProps {
  variant?: "transparent" | "solid";
  user?: AuthenticatedUser | null;
}

async function AuthenticatedNavbar({
  variant,
}: {
  variant: "transparent" | "solid";
}) {
  const user = await getCurrentUser();
  return <Navbar variant={variant} user={user} />;
}

/**
 * Renders the guest Navbar shell immediately during prerender/first paint,
 * then streams the user-authenticated Navbar inside a Suspense boundary
 * without blocking the surrounding page shell.
 */
export function SessionNavbar({
  variant = "transparent",
  user,
}: SessionNavbarProps = {}) {
  if (user !== undefined) {
    return <Navbar variant={variant} user={user} />;
  }

  return (
    <Suspense fallback={<Navbar variant={variant} user={null} />}>
      <AuthenticatedNavbar variant={variant} />
    </Suspense>
  );
}

