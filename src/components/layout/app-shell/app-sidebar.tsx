"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@ui-sdk/react/navigation-menu";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BrandLogoMark } from "@/components/common/brand-logo";
import type { AppShellNavGroup } from "./types";

interface AppSidebarProps {
  groups: AppShellNavGroup[];
  isCollapsed: boolean;
  brandTitle?: string;
  brandSubtitle?: string;
  footer?: ReactNode | ((isCollapsed: boolean) => ReactNode);
  className?: string;
}

export function AppSidebar({
  groups,
  isCollapsed,
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
      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col p-3 space-y-6">
          <div
            className={cn(
              "flex items-center px-1 py-1 min-h-[44px]",
              isCollapsed ? "justify-center" : "justify-between"
            )}
          >
            <Link
              href="/"
              className="flex items-center gap-2.5 min-w-0 group"
              title={`${brandTitle} — ${brandSubtitle}`}
            >
              <BrandLogoMark size="md" className="shrink-0" />
              {!isCollapsed && (
                <div className="flex flex-col min-w-0 transition-opacity duration-150">
                  <span className="font-display font-black text-base tracking-tight text-heading block leading-tight">
                    {brandTitle === "SafiHub" ? (
                      <>
                        Safi<span className="text-primary">Hub</span>
                      </>
                    ) : (
                      brandTitle
                    )}
                  </span>
                  <span className="text-[11px] font-semibold text-primary leading-none">
                    {brandSubtitle}
                  </span>
                </div>
              )}
            </Link>
          </div>

          <NavigationMenu
            orientation="vertical"
            aria-label="Navigation principale"
            className="space-y-5 flex-1"
          >
            {groups.map((group, groupIdx) => (
              <div
                key={group.title ?? groupIdx}
                className="space-y-1"
                data-tour-id={
                  group.title ? "tour-nav-management-group" : undefined
                }
              >
                {!isCollapsed && group.title && (
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2.5 block mb-1">
                    {group.title}
                  </span>
                )}
                {isCollapsed && group.title && (
                  <Separator className="my-2 mx-2 w-auto" />
                )}
                <NavigationMenuList className="space-y-0.5 list-none m-0 p-0">
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

                    const linkNode = (
                      <NavigationMenuLink
                        current={isActive}
                        render={<Link href={item.href} data-tour-id={tourId} />}
                        className={cn(
                          "flex items-center rounded-xl text-xs font-semibold transition-all group min-h-[42px]",
                          isCollapsed
                            ? "justify-center p-2.5"
                            : "gap-3 px-3 py-2.5",
                          isActive
                            ? "bg-primary text-primary-foreground font-bold shadow-xs"
                            : "text-foreground hover:text-heading hover:bg-secondary"
                        )}
                      >
                        <span className="relative inline-flex items-center justify-center shrink-0">
                          <Icon
                            className={cn(
                              "size-4.5 shrink-0",
                              isActive
                                ? "text-primary-foreground"
                                : "text-muted-foreground group-hover:text-heading"
                            )}
                            aria-hidden="true"
                          />
                          {isCollapsed && Boolean(item.badge) && (
                            <span className="absolute -top-1 -right-1 size-2 rounded-full bg-warning ring-2 ring-card" />
                          )}
                        </span>

                        {!isCollapsed && (
                          <>
                            <span className="truncate flex-1">
                              {item.label}
                            </span>
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
                      </NavigationMenuLink>
                    );

                    return (
                      <NavigationMenuItem key={item.href}>
                        {isCollapsed ? (
                          <Tooltip>
                            <TooltipTrigger asChild>{linkNode}</TooltipTrigger>
                            <TooltipContent side="right">
                              {item.label}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          linkNode
                        )}
                      </NavigationMenuItem>
                    );
                  })}
                </NavigationMenuList>
              </div>
            ))}
          </NavigationMenu>
        </div>
      </ScrollArea>

      {footer && (
        <>
          <Separator />
          <div className="p-3 mt-auto">
            {typeof footer === "function" ? footer(isCollapsed) : footer}
          </div>
        </>
      )}
    </aside>
  );
}
