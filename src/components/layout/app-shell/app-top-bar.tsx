"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Volume2,
  VolumeX,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/actions/auth.actions";
import { NotificationsInboxWidget } from "@/components/notifications/notifications-inbox-widget";
import type { AppShellUser } from "./types";

interface AppTopBarProps {
  leftContent?: ReactNode;
  rightExtra?: ReactNode;
  user?: AppShellUser | null;
  publicViewHref?: string;
  publicViewLabel?: string;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  className?: string;
}

export function AppTopBar({
  leftContent,
  rightExtra,
  user,
  publicViewHref,
  publicViewLabel = "Voir ma page publique",
  soundEnabled = true,
  onToggleSound,
  className,
}: AppTopBarProps) {
  const t = useTranslations("appShell.topBar");
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  return (
    <header className={cn("w-full bg-card border-b border-border shadow-xs sticky top-0 z-30 font-sans", className)}>
      <div className="w-full px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* Left slot (e.g. Pressing switcher + status) */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {leftContent}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Sound toggle */}
          {onToggleSound && (
            <button
              type="button"
              onClick={onToggleSound}
              aria-label={soundEnabled ? t("soundDisableAria") : t("soundEnableAria")}
              title={soundEnabled ? t("soundEnabledTitle") : t("soundDisabledTitle")}
              className="size-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-heading hover:bg-secondary transition cursor-pointer"
            >
              {soundEnabled ? (
                <Volume2 className="size-4.5 text-primary" />
              ) : (
                <VolumeX className="size-4.5 text-muted-foreground" />
              )}
            </button>
          )}

          {/* Notifications widget */}
          <NotificationsInboxWidget />

          {/* Public page link */}
          {publicViewHref && (
            <Link
              href={publicViewHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={publicViewLabel}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-foreground bg-secondary hover:bg-primary-soft hover:text-primary hover:border-primary/20 border border-transparent transition"
            >
              <span>{publicViewLabel}</span>
              <ExternalLink className="size-3.5 text-muted-foreground" />
            </Link>
          )}

          {/* Optional extra right actions */}
          {rightExtra}

          {/* Account menu dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAccountOpen((prev) => !prev)}
              aria-expanded={isAccountOpen}
              aria-haspopup="true"
              aria-label={t("userMenuAria")}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-secondary transition cursor-pointer"
            >
              <div className="size-8 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold text-xs">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : <User className="size-4" />}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-heading leading-tight max-w-[120px] truncate">
                  {user?.name || "Partenaire"}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight capitalize">
                  {user?.role === "house" ? "Gérant pressing" : user?.role || "Membre"}
                </span>
              </div>
              <ChevronDown className="size-3 text-muted-foreground hidden sm:block" />
            </button>

            {isAccountOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 rounded-2xl bg-card border border-border shadow-lift py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
              >
                <div className="px-4 py-2 border-b border-border">
                  <p className="text-xs font-bold text-heading truncate">
                    {user?.name || "Partenaire SafiHub"}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {user?.email || "Connecté à l'espace pressing"}
                  </p>
                </div>

                {publicViewHref && (
                  <Link
                    href={publicViewHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsAccountOpen(false)}
                    className="lg:hidden flex items-center justify-between px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition"
                  >
                    <span>{publicViewLabel}</span>
                    <ExternalLink className="size-3.5 text-muted-foreground" />
                  </Link>
                )}

                <form action={logoutAction} className="mt-1 pt-1 border-t border-border">
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive-soft transition cursor-pointer"
                  >
                    <LogOut className="size-3.5" />
                    <span>{t("logout")}</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
