import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { MobileNav } from "./mobile-nav";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/actions/auth.actions";
import { getRoleCta } from "@/lib/role-cta";
import type { AuthenticatedUser } from "@/services/auth/guards";

interface NavbarProps {
  variant?: "transparent" | "solid";
  user?: AuthenticatedUser | null;
}

export function Navbar({ variant = "transparent", user }: NavbarProps = {}) {
  const isSolid = variant === "solid";
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");

  const cta = getRoleCta(user);
  const ctaHref = cta.roleKey === "guest" || cta.roleKey === "customer" ? "/#catalogue" : cta.href;
  const ctaLabel =
    cta.roleKey === "admin"
      ? tNav("adminPortal")
      : cta.roleKey === "courier"
        ? tNav("courierPortal")
        : cta.roleKey === "house"
          ? tNav("housePortal")
          : tNav("order");

  const isAuthenticated = Boolean(user && !user.isGuest);

  return (
    <header
      className={
        isSolid
          ? "sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs transition-all pointer-events-auto"
          : "fixed top-0 left-0 right-0 z-50 w-full bg-transparent transition-all pointer-events-none"
      }
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 flex h-20 items-center justify-between gap-4 pointer-events-auto">
        {/* Brand logo: star/asterisk mark + SafiHub on far left */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="text-primary flex items-center justify-center">
            <Sparkles className="size-6 text-primary fill-primary" />
          </div>
          <span className="font-display font-black text-2xl tracking-tight text-heading">
            {tCommon("brand")}
            <span className="text-primary">.</span>
          </span>
        </Link>

        {/* Center Pill Segmented Nav */}
        <nav className="hidden md:flex items-center bg-white/95 backdrop-blur-xs border border-slate-200/90 shadow-xs rounded-full px-2 py-1 text-xs sm:text-sm font-semibold text-foreground">
          <Link
            href="/#catalogue"
            className="px-4 py-1.5 rounded-full text-heading hover:text-primary transition-colors"
          >
            {tNav("individuals")}
          </Link>
          <Link
            href="/#services"
            className="px-4 py-1.5 rounded-full text-heading hover:text-primary transition-colors"
          >
            {tNav("businesses")}
          </Link>
          <Link
            href="/house"
            className="px-4 py-1.5 rounded-full text-heading hover:text-primary transition-colors"
          >
            {tNav("houses")}
          </Link>
        </nav>

        {/* Right actions: Log In / Sign Out + CTA button */}
        <div className="hidden sm:flex items-center gap-6">
          {isAuthenticated ? (
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-sm font-semibold text-heading hover:text-primary transition-colors cursor-pointer"
              >
                {tNav("logout")}
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="text-sm font-semibold text-heading hover:text-primary transition-colors"
            >
              {tNav("login")}
            </Link>
          )}
          <Button
            asChild
            variant="contrast"
            size="pill-sm"
            className="shadow-xs"
          >
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-3">
          <Button
            asChild
            variant="contrast"
            size="sm"
            className="rounded-full text-xs font-semibold px-3.5"
          >
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
          <MobileNav user={user} />
        </div>
      </div>
    </header>
  );
}
