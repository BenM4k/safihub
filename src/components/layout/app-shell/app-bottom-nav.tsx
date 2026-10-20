"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import type { AppShellNavGroup, AppShellNavItem, AppShellUser } from "./types";

interface AppBottomNavProps {
  tabs: AppShellNavItem[];
  moreGroups?: AppShellNavGroup[];
  user?: AppShellUser | null;
  className?: string;
}

export function AppBottomNav({
  tabs,
  moreGroups = [],
  user,
  className,
}: AppBottomNavProps) {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  function isItemActive(href: string, exactMatch?: boolean) {
    if (exactMatch) {
      return pathname === href;
    }
    return pathname === href || (href !== "/" && pathname.startsWith(href));
  }

  const isMoreActive = moreGroups.some((group) =>
    group.items.some((item) => isItemActive(item.href, item.exactMatch))
  );

  return (
    <>
      <nav
        aria-label="Navigation mobile"
        className={cn(
          "md:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-md border-t border-border shadow-nav px-2 pt-1.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] font-sans",
          className
        )}
      >
        <div className="grid grid-cols-5 items-center justify-around gap-1 max-w-lg mx-auto">
          {tabs.slice(0, 4).map((tab) => {
            const isActive = isItemActive(tab.href, tab.exactMatch);
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center min-h-[46px] rounded-xl py-1 px-1 transition relative",
                  isActive
                    ? "text-primary font-bold"
                    : "text-muted-foreground hover:text-heading"
                )}
              >
                <div className="relative">
                  <Icon className="size-5 shrink-0" />
                  {Boolean(tab.badge) && (
                    <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-warning text-white min-w-[16px] text-center leading-tight">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight mt-1 truncate max-w-full">
                  {tab.label}
                </span>
              </Link>
            );
          })}

          {/* Plus button */}
          <button
            type="button"
            onClick={() => setIsMoreOpen(true)}
            aria-expanded={isMoreOpen}
            aria-label="Plus d'options de navigation"
            className={cn(
              "flex flex-col items-center justify-center min-h-[46px] rounded-xl py-1 px-1 transition relative cursor-pointer",
              isMoreActive || isMoreOpen
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-heading"
            )}
          >
            <MoreHorizontal className="size-5 shrink-0" />
            <span className="text-[10px] tracking-tight mt-1">Plus</span>
          </button>
        </div>
      </nav>

      {/* Slide-up sheet for 'Plus' */}
      {isMoreOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu complémentaire"
          className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/40 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsMoreOpen(false)}
        >
          <div
            className="w-full bg-card rounded-t-3xl max-h-[85vh] overflow-y-auto p-5 space-y-6 shadow-lift border-t border-border animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-display font-black text-base text-heading">
                  Menu Pressing
                </h3>
                {user?.name && (
                  <p className="text-xs text-muted-foreground">
                    Connecté en tant que <strong className="text-foreground">{user.name}</strong>
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                aria-label="Fermer le menu"
                className="size-9 rounded-full bg-secondary text-muted-foreground flex items-center justify-center hover:bg-secondary/80 transition cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* More groups */}
            <div className="space-y-4">
              {moreGroups.map((group, idx) => (
                <div key={group.title ?? idx} className="space-y-1.5">
                  {group.title && (
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block px-2">
                      {group.title}
                    </span>
                  )}
                  <div className="grid gap-1">
                    {group.items.map((item) => {
                      const isActive = isItemActive(item.href, item.exactMatch);
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMoreOpen(false)}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-2xl text-xs font-semibold transition min-h-[44px]",
                            isActive
                              ? "bg-primary text-primary-foreground font-bold shadow-xs"
                              : "bg-surface text-foreground hover:bg-secondary"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="size-4.5 shrink-0" />
                            <span>{item.label}</span>
                          </div>
                          {Boolean(item.badge) && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-warning-soft text-warning border border-warning/30">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Logout button */}
            <div className="pt-2 border-t border-border">
              <form action={logoutAction} className="w-full">
                <Button
                  type="submit"
                  variant="ghost"
                  className="w-full justify-center text-xs font-bold text-destructive hover:text-destructive hover:bg-destructive-soft h-11 rounded-2xl"
                >
                  <LogOut className="size-4 mr-2" />
                  <span>Déconnexion</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
