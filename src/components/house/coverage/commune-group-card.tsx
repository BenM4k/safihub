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
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
      {/* Group Header */}
      <div className="p-3.5 sm:p-4 bg-surface border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? "Replier" : "Déplier"} ${displayName}`}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-heading transition"
          >
            {isExpanded ? (
              <ChevronUp className="size-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="size-4" aria-hidden="true" />
            )}
          </button>

          <div className="space-y-0.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-sm text-heading flex items-center gap-1.5 font-display">
                <MapPin className="size-3.5 text-primary shrink-0" aria-hidden="true" />
                {displayName}
              </span>

              {/* Constant distance level badge */}
              {constantDistanceLevel != null && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary-soft text-primary border border-primary/20">
                  {getDistanceLevelShortLabel(constantDistanceLevel)}
                </span>
              )}

              {/* Delivery Fee badge */}
              {deliveryFee && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-success-soft text-success border border-success/30">
                  <Coins className="size-3" aria-hidden="true" />
                  <span>{t("deliveryFeeLabel", { fee: deliveryFee })}</span>
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              {coveredCount} / {items.length} desservis ({eligibleItems.length} éligibles)
            </p>
          </div>
        </div>

        {/* Bulk Action: Tri-state select/deselect */}
        {eligibleItems.length > 0 && (
          <div className="shrink-0 flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onToggleGroup(items)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border border-border bg-card hover:bg-muted text-heading min-h-[38px] shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
              title={triState === "all" ? t("deselectAll") : t("selectAll")}
            >
              {triState === "all" ? (
                <>
                  <CheckSquare2 className="size-4 text-primary" aria-hidden="true" />
                  <span>{t("deselectAll")}</span>
                </>
              ) : triState === "some" ? (
                <>
                  <MinusSquare className="size-4 text-primary" aria-hidden="true" />
                  <span>{t("selectAll")}</span>
                </>
              ) : (
                <>
                  <Square className="size-4 text-muted-foreground" aria-hidden="true" />
                  <span>{t("selectAll")}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Quartiers list */}
      {isExpanded && (
        <div className="divide-y divide-border">
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
