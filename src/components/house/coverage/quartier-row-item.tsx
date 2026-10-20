"use client";

import { useTranslations } from "next-intl";
import { AlertCircle, Check, Clock, ShoppingBag, Users } from "lucide-react";
import type { HouseCoverageWithLimitsItem } from "@/dal";
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
      className={`p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition border-b border-border last:border-b-0 ${
        !isAllowed
          ? "bg-surface/40 opacity-70"
          : isDirty
          ? "bg-primary-soft/40 hover:bg-primary-soft/50"
          : "hover:bg-surface/70"
      }`}
    >
      {/* Left: Quartier info, badges and reasons */}
      <div className="space-y-1.5 min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-heading text-sm font-display">
            {item.neighborhoodName}
          </span>

          {/* Distance Level Tag */}
          <span
            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
              isAllowed
                ? "bg-secondary text-secondary-foreground border-border"
                : "bg-destructive-soft text-destructive border-destructive/20"
            }`}
          >
            {getDistanceLevelShortLabel(item.distanceLevel)}
          </span>

          {/* Dirty Marker */}
          {isDirty && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-warning-soft text-warning border border-warning/30 animate-in fade-in duration-150">
              <span className="size-1.5 rounded-full bg-warning animate-pulse" aria-hidden="true" />
              <span>{t("modifiedBadge")}</span>
            </span>
          )}

          {/* Active Orders in progress */}
          {(item.activeOrdersCount ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-primary-soft text-primary border border-primary/20">
              <Clock className="size-3" aria-hidden="true" />
              <span>{t("activeOrdersCount", { count: item.activeOrdersCount ?? 0 })}</span>
            </span>
          )}

          {/* 30-day order volume */}
          {(item.orders30dCount ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface text-muted-foreground border border-border">
              <ShoppingBag className="size-3" aria-hidden="true" />
              <span>{t("orders30d", { count: item.orders30dCount ?? 0 })}</span>
            </span>
          )}

          {/* Customer demand requests from non-covered quartiers */}
          {!isCovered && (item.demandCount ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-success-soft text-success border border-success/30">
              <Users className="size-3" aria-hidden="true" />
              <span>{t("demandWaiting", { count: item.demandCount ?? 0 })}</span>
            </span>
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

      {/* Right: Switch with accessible tap target ≥ 44px */}
      <div className="shrink-0 flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t border-border/50 sm:border-t-0">
        <button
          type="button"
          disabled={isSwitchDisabled}
          onClick={() => onToggle(item.neighborhoodId)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors select-none ${
            isSwitchDisabled
              ? "cursor-not-allowed opacity-50 bg-surface text-muted-foreground border border-border"
              : isCovered
              ? "cursor-pointer bg-primary-soft text-primary border border-primary/20 hover:bg-primary-soft/80"
              : "cursor-pointer bg-surface text-muted-foreground border border-border hover:bg-muted hover:text-heading"
          }`}
        >
          <span
            className={`size-1.5 rounded-full ${
              isCovered ? "bg-primary animate-pulse" : "bg-ink-400"
            }`}
            aria-hidden="true"
          />
          <span>{isCovered ? t("served") : t("notServed")}</span>
        </button>

        <button
          type="button"
          role="switch"
          aria-checked={isCovered}
          aria-label={t("switchLabel", { neighborhood: item.neighborhoodName })}
          disabled={isSwitchDisabled}
          onClick={() => onToggle(item.neighborhoodId)}
          className={`group relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 before:absolute before:-inset-2 before:content-[''] ${
            isSwitchDisabled
              ? "cursor-not-allowed opacity-40 bg-ink-200 dark:bg-ink-800 border border-border"
              : isCovered
              ? "cursor-pointer bg-primary shadow-xs"
              : "cursor-pointer bg-ink-200 dark:bg-ink-700 border border-ink-300 dark:border-ink-600 hover:bg-ink-300"
          }`}
        >
          {/* Visual Knob */}
          <span
            className={`pointer-events-none flex size-6 items-center justify-center rounded-full bg-white shadow-card transition-transform duration-200 ease-in-out ${
              isCovered ? "translate-x-5 text-primary" : "translate-x-0 text-ink-400"
            }`}
          >
            {isCovered ? (
              <Check className="size-3.5 stroke-[2.5]" aria-hidden="true" />
            ) : (
              <span className="size-1.5 rounded-full bg-ink-400" aria-hidden="true" />
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
