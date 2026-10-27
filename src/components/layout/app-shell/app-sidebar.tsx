"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppShellNavGroup } from "./types";

interface AppSidebarProps {
  groups: AppShellNavGroup[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  brandTitle?: string;
  brandSubtitle?: string;
  footer?: ReactNode | ((isCollapsed: boolean) => ReactNode);
  className?: string;
}

export function AppSidebar({
  groups,
  isCollapsed,
  onToggleCollapse,
  brandTitle = "SafiHub",
  brandSubtitle = "Pressing",
  footer,
  className,
}: AppSidebarProps) {
  const pathname = usePathname();

  function isItemActive(href: string, exactMatch?: boolean) {
    if (exactMatch) {
      return pathname === href;
    }
    return pathname === href || (href !== "/" && pathname.startsWith(href));
  }

  return (
    <aside
      aria-label="Navigation principale"
      className={cn(
        "bg-card border-r border-border flex flex-col justify-between shrink-0 h-full transition-[width] duration-200 ease-in-out font-sans z-20",
        isCollapsed ? "w-[72px]" : "w-60",
        className
      )}
    >
      <div className="flex flex-col flex-1 overflow-y-auto p-3 space-y-6">
        {/* Brand header */}
        <div className="flex items-center justify-between px-1 py-1 min-h-[44px]">
          <Link
            href="/"
            className="flex items-center gap-2.5 min-w-0 group"
            title={`${brandTitle} — ${brandSubtitle}`}
          >
            <div className="size-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-black text-sm shadow-xs shrink-0 group-hover:bg-primary-hover transition">
              <Store className="size-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 transition-opacity duration-150">
                <span className="font-display font-black text-base tracking-tight text-heading block leading-tight">
                  {brandTitle}
                </span>
                <span className="text-[11px] font-semibold text-primary leading-none">
                  {brandSubtitle}
                </span>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? "Développer le menu latéral" : "Réduire le menu latéral"}
            title={isCollapsed ? "Développer (Alt+S)" : "Réduire (Alt+S)"}
            className="hidden md:inline-flex size-8 rounded-lg items-center justify-center text-muted-foreground hover:text-heading hover:bg-secondary transition cursor-pointer shrink-0"
          >
            {isCollapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </button>
        </div>

        {/* Grouped navigation */}
        <nav className="space-y-5 flex-1">
          {groups.map((group, groupIdx) => (
            <div
              key={group.title ?? groupIdx}
              className="space-y-1"
              data-tour-id={group.title ? "tour-nav-management-group" : undefined}
            >
              {!isCollapsed && group.title && (
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2.5 block mb-1">
                  {group.title}
                </span>
              )}
              {isCollapsed && group.title && (
                <div className="h-px bg-border my-2 mx-2" aria-hidden="true" />
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = isItemActive(item.href, item.exactMatch);
                  const Icon = item.icon;
                  const tourId = item.href.endsWith("/orders")
                    ? "tour-nav-orders"
                    : item.href.endsWith("/catalogue")
                      ? "tour-nav-catalogue"
                      : item.href.endsWith("/settlements")
                        ? "tour-nav-settlements"
                        : undefined;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      data-tour-id={tourId}
                      aria-current={isActive ? "page" : undefined}
                      title={isCollapsed ? item.label : undefined}
                      className={cn(
                        "flex items-center rounded-xl text-xs font-semibold transition-all group min-h-[42px]",
                        isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                        isActive
                          ? "bg-primary text-primary-foreground font-bold shadow-xs"
                          : "text-foreground hover:text-heading hover:bg-secondary"
                      )}
                    >
                      <span className="relative inline-flex items-center justify-center shrink-0">
                        <Icon className={cn("size-4.5 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-heading")} />
                        {isCollapsed && Boolean(item.badge) && (
                          <span className="absolute -top-1 -right-1 size-2 rounded-full bg-warning ring-2 ring-card" />
                        )}
                      </span>

                      {!isCollapsed && (
                        <>
                          <span className="truncate flex-1">{item.label}</span>
                          {Boolean(item.badge) && (
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0",
                                isActive
                                  ? "bg-primary-foreground/20 text-primary-foreground"
                                  : "bg-warning-soft text-warning border border-warning/30 font-bold"
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {footer && (
        <div className="p-3 border-t border-border mt-auto">
          {typeof footer === "function" ? footer(isCollapsed) : footer}
        </div>
      )}
    </aside>
  );
}
