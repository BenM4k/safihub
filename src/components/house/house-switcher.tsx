"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Building2, ChevronDown, Check, ArrowRight } from "lucide-react";
import type { HouseMembershipInfo } from "@/dal";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HouseSwitcherProps {
  houseName: string;
  currentSlug?: string;
  isPaused?: boolean;
  memberships?: HouseMembershipInfo[];
}

/**
 * Accessible laundry house switcher using shadcn DropdownMenu primitives.
 */
export function HouseSwitcher({
  houseName,
  currentSlug,
  isPaused,
  memberships = [],
}: HouseSwitcherProps) {
  const t = useTranslations("house.header");
  const hasMultiple = memberships.length > 1;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label={t("selectHouse")}
          className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 h-auto rounded-xl border-border bg-card hover:bg-secondary hover:border-border text-xs font-semibold text-foreground shadow-2xs max-w-[150px] sm:max-w-[280px] min-w-0"
        >
          <Building2 className="size-3.5 text-primary shrink-0" />
          <span className="truncate">{houseName}</span>
          {isPaused ? (
            <Badge
              variant="warning"
              className="px-1.5 py-0 text-[10px] font-bold shrink-0"
            >
              {t("paused")}
            </Badge>
          ) : (
            <span className="size-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
          )}
          <ChevronDown className="size-3.5 text-muted-foreground shrink-0 transition-transform duration-200" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-64 rounded-2xl bg-card border-border shadow-lift p-1.5 z-50"
      >
        <div className="px-3 py-1.5 border-b border-border flex items-center justify-between">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            {t("selectHouse")}
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground">
            {t("pressingsCount", { count: memberships.length })}
          </span>
        </div>

        <div className="max-h-56 overflow-y-auto py-1">
          {memberships.map((m) => {
            const isCurrent = m.houseSlug === currentSlug;
            return (
              <DropdownMenuItem key={m.houseId} asChild>
                <Link
                  href={`/partner/${m.houseSlug}`}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg cursor-pointer transition-colors",
                    isCurrent
                      ? "bg-primary-soft text-primary font-bold"
                      : "text-foreground hover:bg-secondary"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={cn(
                        "size-1.5 rounded-full shrink-0",
                        m.isPaused ? "bg-amber-500" : "bg-emerald-500"
                      )}
                    />
                    <span className="truncate">{m.houseName}</span>
                  </div>
                  {isCurrent && (
                    <Check className="size-3.5 text-primary shrink-0" />
                  )}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </div>

        {hasMultiple && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/partner"
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-primary hover:bg-primary-soft transition-colors cursor-pointer"
              >
                <span>{t("allHouses")}</span>
                <ArrowRight className="size-3" />
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
