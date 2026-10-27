"use client";

import { useTranslations } from "next-intl";
import { AlertCircle, Clock, ShoppingBag, Users } from "lucide-react";
import type { HouseCoverageWithLimitsItem } from "@/dal";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { getDistanceLevelShortLabel } from "./types";

interface QuartierRowItemProps {
  item: HouseCoverageWithLimitsItem;
  isCovered: boolean;
  isDirty: boolean;
  disabled: boolean;
  effectiveMaxDistance: number;
  onToggle: (neighborhoodId: string) => void;
}

export function QuartierRowItem({
  item,
  isCovered,
  isDirty,
  disabled,
  effectiveMaxDistance,
  onToggle,
}: QuartierRowItemProps) {
  const t = useTranslations("house.coverage");
  const isAllowed = item.isAllowedByDistance;
  const isSwitchDisabled = disabled || !isAllowed;

  return (
    <div
      className={`p-3.5 sm:px-4 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition min-h-[48px] sm:min-h-[44px] ${
        !isAllowed
          ? "opacity-50 bg-muted/5"
          : isDirty
          ? "bg-primary-soft/25"
          : "hover:bg-muted/30"
      }`}
    >
      {/* Left: Quartier info, badges and reasons */}
      <div className="space-y-1 min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-heading text-sm font-display">
            {item.neighborhoodName}
          </span>

          {/* Distance Level Tag */}
          <Badge
            variant="outline"
            className={`text-[11px] font-semibold border ${
              isAllowed
                ? "bg-secondary text-secondary-foreground border-border"
                : "bg-destructive-soft text-destructive border-destructive/20"
            }`}
          >
            {getDistanceLevelShortLabel(item.distanceLevel)}
          </Badge>

          {/* Dirty Marker */}
          {isDirty && (
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-warning-soft text-warning border-warning/30 animate-in fade-in duration-150"
            >
              <span className="size-1.5 rounded-full bg-warning animate-pulse" aria-hidden="true" />
              <span>{t("modifiedBadge")}</span>
            </Badge>
          )}

          {/* Active Orders in progress */}
          {(item.activeOrdersCount ?? 0) > 0 && (
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1 text-[11px] font-bold bg-primary-soft text-primary border-primary/20"
            >
              <Clock className="size-3" aria-hidden="true" />
              <span>{t("activeOrdersCount", { count: item.activeOrdersCount ?? 0 })}</span>
            </Badge>
          )}

          {/* 30-day order volume */}
          {(item.orders30dCount ?? 0) > 0 && (
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1 text-[11px] font-medium bg-muted/40 text-muted-foreground border-border"
            >
              <ShoppingBag className="size-3" aria-hidden="true" />
              <span>{t("orders30d", { count: item.orders30dCount ?? 0 })}</span>
            </Badge>
          )}

          {/* Customer demand requests from non-covered quartiers */}
          {!isCovered && (item.demandCount ?? 0) > 0 && (
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1 text-[11px] font-semibold bg-success-soft text-success border-success/30"
            >
              <Users className="size-3" aria-hidden="true" />
              <span>{t("demandWaiting", { count: item.demandCount ?? 0 })}</span>
            </Badge>
          )}
        </div>

        {/* Ineligible Explanation */}
        {!isAllowed && (
          <p className="flex items-center gap-1.5 text-[11px] font-medium text-destructive">
            <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
            <span>
              {t("tooFar", {
                level: item.distanceLevel ?? "—",
                limit: effectiveMaxDistance,
              })}
            </span>
          </p>
        )}
      </div>

      {/* Right: Switch with accessible toggle */}
      <div className="shrink-0 flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t border-border/30 sm:border-t-0">
        <span
          className={`text-xs font-semibold select-none ${
            isCovered ? "text-primary font-bold" : "text-muted-foreground"
          }`}
        >
          {isCovered ? t("served") : t("notServed")}
        </span>

        <Switch
          checked={isCovered}
          onCheckedChange={() => onToggle(item.neighborhoodId)}
          disabled={isSwitchDisabled}
          aria-label={t("switchLabel", { neighborhood: item.neighborhoodName })}
          className="cursor-pointer"
        />
      </div>
    </div>
  );
}
