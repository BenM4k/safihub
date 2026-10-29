"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ChevronDown,
  MapPin,
  CheckSquare2,
  Square,
  MinusSquare,
} from "lucide-react";
import type { HouseCoverageWithLimitsItem } from "@/dal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuartierRowItem } from "./quartier-row-item";
import { getDistanceLevelShortLabel, type TriState } from "./types";

interface CommuneGroupCardProps {
  zoneName: string;
  items: HouseCoverageWithLimitsItem[];
  coveredMap: Record<string, boolean>;
  dirtyIds: Set<string>;
  disabled: boolean;
  effectiveMaxDistance: number;
  triState: TriState;
  onToggleQuartier: (neighborhoodId: string) => void;
  onToggleGroup: (items: HouseCoverageWithLimitsItem[]) => void;
}

export function CommuneGroupCard({
  zoneName,
  items,
  coveredMap,
  dirtyIds,
  disabled,
  effectiveMaxDistance,
  triState,
  onToggleQuartier,
  onToggleGroup,
}: CommuneGroupCardProps) {
  const t = useTranslations("house.coverage");
  const [isExpanded, setIsExpanded] = useState(true);

  const eligibleItems = useMemo(
    () => items.filter((i) => i.isAllowedByDistance),
    [items]
  );

  const coveredCount = useMemo(
    () => items.filter((i) => Boolean(coveredMap[i.neighborhoodId])).length,
    [items, coveredMap]
  );

  // Group distance level when constant
  const constantDistanceLevel = useMemo(() => {
    if (items.length === 0) return null;
    const first = items[0].distanceLevel;
    const isUniform = items.every((i) => i.distanceLevel === first);
    return isUniform ? first : null;
  }, [items]);

  const displayName = zoneName.toLowerCase().startsWith("commune")
    ? zoneName
    : `Commune de ${zoneName}`;

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-card divide-y divide-border/60">
      {/* Group Header */}
      <div className="p-3.5 sm:p-4 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-label={t(isExpanded ? "collapseZoneAria" : "expandZoneAria", { zone: displayName })}
            className="size-8 rounded-lg p-0 text-muted-foreground hover:text-heading hover:bg-muted/40 transition shrink-0 cursor-pointer"
          >
            <ChevronDown
              className={`size-4 transition-transform duration-500 ease-in-out ${
                isExpanded ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </Button>

          <div className="space-y-0.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-sm text-heading flex items-center gap-1.5 font-display">
                <MapPin className="size-3.5 text-primary shrink-0" aria-hidden="true" />
                {displayName}
              </span>

              {/* Constant distance level badge */}
              {constantDistanceLevel != null && (
                <Badge variant="outline" className="text-[11px] font-semibold rounded-full bg-primary-soft text-primary border-primary/20">
                  {getDistanceLevelShortLabel(constantDistanceLevel)}
                </Badge>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              {t("coveredStats", {
                covered: coveredCount,
                total: items.length,
                eligible: eligibleItems.length,
              })}
            </p>
          </div>
        </div>

        {/* Bulk Action: Tri-state select/deselect */}
        {eligibleItems.length > 0 && (
          <div className="shrink-0 flex items-center gap-2 self-start sm:self-auto">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => onToggleGroup(items)}
              className="h-9 px-3 text-xs font-semibold rounded-lg text-heading hover:text-primary hover:bg-muted/40 transition min-h-[36px] flex items-center cursor-pointer"
              title={triState === "all" ? t("deselectAll") : t("selectAll")}
            >
              {triState === "all" ? (
                <>
                  <CheckSquare2 className="size-4 mr-1.5 text-primary" aria-hidden="true" />
                  <span>{t("deselectAll")}</span>
                </>
              ) : triState === "some" ? (
                <>
                  <MinusSquare className="size-4 mr-1.5 text-primary" aria-hidden="true" />
                  <span>{t("selectAll")}</span>
                </>
              ) : (
                <>
                  <Square className="size-4 mr-1.5 text-muted-foreground" aria-hidden="true" />
                  <span>{t("selectAll")}</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Quartiers list with smooth 500ms CSS grid accordion */}
      <div
        className={`grid transition-all duration-500 ease-in-out ${
          isExpanded
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0 pointer-events-none"
        }`}
      >
        <div className="overflow-hidden">
          <div className="divide-y divide-border/60">
            {items.map((item) => (
              <QuartierRowItem
                key={item.neighborhoodId}
                item={item}
                isCovered={Boolean(coveredMap[item.neighborhoodId])}
                isDirty={dirtyIds.has(item.neighborhoodId)}
                disabled={disabled}
                effectiveMaxDistance={effectiveMaxDistance}
                onToggle={onToggleQuartier}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
