"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ChevronDown,
  ChevronUp,
  Coins,
  MapPin,
  CheckSquare2,
  Square,
  MinusSquare,
} from "lucide-react";
import type { HouseCoverageWithLimitsItem } from "@/dal";
import { formatMoney } from "@/lib/cash-formatters";
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

  // Group delivery fee
  const deliveryFee = useMemo(() => {
    const itemWithFee = items.find((i) => i.deliveryFee != null);
    if (!itemWithFee || itemWithFee.deliveryFee == null) return null;
    return formatMoney(itemWithFee.deliveryFee, itemWithFee.deliveryFeeCurrency || "CDF");
  }, [items]);

  const displayName = zoneName.toLowerCase().startsWith("commune")
    ? zoneName
    : `Commune de ${zoneName}`;

  return (
    <div className="border-b border-border py-2">
      {/* Group Header */}
      <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-label={t(isExpanded ? "collapseZoneAria" : "expandZoneAria", { zone: displayName })}
            className="size-7 p-0 text-muted-foreground hover:text-heading"
          >
            {isExpanded ? (
              <ChevronUp className="size-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="size-4" aria-hidden="true" />
            )}
          </Button>

          <div className="space-y-0.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-sm text-heading flex items-center gap-1.5 font-display">
                <MapPin className="size-3.5 text-primary shrink-0" aria-hidden="true" />
                {displayName}
              </span>

              {/* Constant distance level badge */}
              {constantDistanceLevel != null && (
                <Badge variant="outline" className="text-[11px] font-semibold bg-primary-soft text-primary border-primary/20">
                  {getDistanceLevelShortLabel(constantDistanceLevel)}
                </Badge>
              )}

              {/* Delivery Fee badge */}
              {deliveryFee && (
                <Badge variant="outline" className="inline-flex items-center gap-1 text-[11px] font-semibold bg-success-soft text-success border-success/30">
                  <Coins className="size-3" aria-hidden="true" />
                  <span>{t("deliveryFeeLabel", { fee: deliveryFee })}</span>
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
              className="h-8 text-xs font-semibold rounded-lg text-heading hover:text-primary hover:bg-transparent"
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

      {/* Quartiers list */}
      {isExpanded && (
        <div className="divide-y divide-border/60 pl-2 sm:pl-4">
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
      )}
    </div>
  );
}
