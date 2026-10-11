"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Menu, X, ArrowRight, Phone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/actions/auth.actions";
import { getRoleCta } from "@/lib/role-cta";
import type { AuthenticatedUser } from "@/services/auth/guards";

export function MobileNav({ user }: { user?: AuthenticatedUser | null } = {}) {
  const [isOpen, setIsOpen] = useState(false);
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
          : tCommon("orderNow");

  const isAuthenticated = Boolean(user && !user.isGuest);

  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);

  return (
    <div className="md:hidden">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={toggle}
        aria-label={isOpen ? tNav("closeMenu") : tNav("openMenu")}
        aria-expanded={isOpen}
        className="touch text-heading"
      >
        {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 top-20 z-50 bg-background/95 backdrop-blur-md animate-fade-in flex flex-col justify-between p-6 overflow-y-auto">
          <nav className="flex flex-col gap-4 text-base font-bold tracking-tight">
            <Link
              href="/"
              onClick={close}
              className="link-quiet py-2.5 border-b border-border text-heading flex items-center justify-between"
            >
              {tNav("home")}
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
            <Link
              href="/houses"
              onClick={close}
              className="link-quiet py-2.5 border-b border-border text-heading flex items-center justify-between"
            >
              {tNav("houses")}
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  href="/cart"
                  onClick={close}
                  className="link-quiet py-2.5 border-b border-border text-heading flex items-center justify-between"
                >
                  {tNav("cart")}
                  <ArrowRight className="size-4 text-muted-foreground" />
                </Link>
                <Link
                  href="/orders"
                  onClick={close}
                  className="link-quiet py-2.5 border-b border-border text-heading flex items-center justify-between text-primary"
                >
                  {tNav("myOrders")}
                  <ArrowRight className="size-4 text-muted-foreground" />
                </Link>
                <Link
                  href="/account"
                  onClick={close}
                  className="link-quiet py-2.5 border-b border-border text-heading flex items-center justify-between"
                >
                  {tNav("myAccount")}
                  <ArrowRight className="size-4 text-muted-foreground" />
                </Link>
                <Link
                  href="/notifications"
                  onClick={close}
                  className="link-quiet py-2.5 border-b border-border text-heading flex items-center justify-between"
                >
                  {tNav("notifications")}
                  <ArrowRight className="size-4 text-muted-foreground" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/partners/apply"
                  onClick={close}
                  className="link-quiet py-2.5 border-b border-border text-heading flex items-center justify-between text-violet-700"
                >
                  {tNav("becomePartner")}
                  <ArrowRight className="size-4 text-muted-foreground" />
                </Link>
                <Link
                  href="/login"
                  onClick={close}
                  className="link-quiet py-2.5 border-b border-border text-heading flex items-center justify-between"
                >
                  {tNav("login")}
                  <ArrowRight className="size-4 text-muted-foreground" />
                </Link>
                <Link
                  href="/register"
                  onClick={close}
                  className="link-quiet py-2.5 border-b border-border text-heading flex items-center justify-between text-primary"
                >
                  {tNav("register")}
                  <ArrowRight className="size-4 text-muted-foreground" />
                </Link>
              </>
            )}
            <Link
              href="/#services"
              onClick={close}
              className="link-quiet py-2 border-b border-border text-xs text-muted-foreground flex items-center justify-between pt-3"
            >
              {tNav("services")}
              <ArrowRight className="size-3 text-muted-foreground" />
            </Link>
          </nav>

          <div className="flex flex-col gap-3 pt-6 border-t border-border mt-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Phone className="size-4 text-primary" />
              <span>{tCommon("supportBukavu")}</span>
            </div>
            {isAuthenticated && cta.roleKey !== "guest" && cta.roleKey !== "customer" && (
              <Button asChild variant="outline" size="sm" className="w-full mb-1">
                <Link href={ctaHref} onClick={close}>
                  <Sparkles className="size-4 mr-1" />
                  {ctaLabel}
                </Link>
              </Button>
            )}
            {isAuthenticated ? (
              <form action={logoutAction} className="w-full">
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {tNav("logout")}
                </Button>
              </form>
            ) : (
              <Button asChild variant="contrast" size="lg" className="w-full">
                <Link href="/register" onClick={close}>
                  <Sparkles className="size-4 mr-1" />
                  {tNav("register")}
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

