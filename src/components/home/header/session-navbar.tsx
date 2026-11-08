import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { BrandLogoMark } from "@/components/common/brand-logo";
import { getCurrentUser } from "@/services/auth";
import { Navbar } from "./navbar";
import type { AuthenticatedUser } from "@/services/auth/guards";

interface SessionNavbarProps {
  variant?: "transparent" | "solid";
  user?: AuthenticatedUser | null;
}

/**
 * Pure static navbar fallback that does not read request-time cookies/i18n,
 * so routes using <SessionNavbar /> can prerender an instant static shell
 * under Next.js 16 Cache Components.
 */
function NavbarStaticFallback({
  variant = "transparent",
}: {
  variant?: "transparent" | "solid";
}) {
  const isSolid = variant === "solid";
  return (
    <header
      className={
        isSolid
          ? "sticky top-0 left-0 right-0 z-50 w-full bg-white/95 dark:bg-card/95 backdrop-blur-md border-b border-slate-200/90 dark:border-border shadow-2xs transition-all pointer-events-auto"
          : "fixed top-0 left-0 right-0 z-50 w-full bg-transparent transition-all pointer-events-none"
      }
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 flex h-20 items-center justify-between gap-4 pointer-events-auto">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <BrandLogoMark size="md" />
          <span className="font-display font-black text-2xl tracking-tight text-heading">
            Safi<span className="text-primary">Hub</span>
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-2 bg-slate-100/70 dark:bg-white/5 rounded-full px-4 py-2">
          <div className="h-3.5 w-14 rounded-full bg-slate-200 dark:bg-white/10 animate-pulse" />
          <div className="h-3.5 w-16 rounded-full bg-slate-200 dark:bg-white/10 animate-pulse" />
          <div className="h-3.5 w-24 rounded-full bg-slate-200 dark:bg-white/10 animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-24 rounded-full bg-slate-200 dark:bg-white/10 animate-pulse" />
        </div>
      </div>
    </header>
  );
}

async function AuthenticatedNavbar({
  variant,
}: {
  variant: "transparent" | "solid";
}) {
  await connection();
  const user = await getCurrentUser();
  return <Navbar variant={variant} user={user} />;
}

/**
 * Renders the static Navbar shell immediately during prerender/first paint,
 * then streams the user-authenticated Navbar inside a Suspense boundary
 * without blocking the surrounding page shell.
 */
export function SessionNavbar({
  variant = "transparent",
  user,
}: SessionNavbarProps = {}) {
  if (user !== undefined) {
    return (
      <Suspense fallback={<NavbarStaticFallback variant={variant} />}>
        <Navbar variant={variant} user={user} />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<NavbarStaticFallback variant={variant} />}>
      <AuthenticatedNavbar variant={variant} />
    </Suspense>
  );
}

