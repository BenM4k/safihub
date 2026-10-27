"use client";

import { useTranslations } from "next-intl";
import { Pencil, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import type { HouseCatalogueItemRecord } from "@/dal";
import { formatMoney } from "@/lib/cash-formatters";
import {
  calculateNetPayout,
  isCellDirty,
  isOutlierChange,
} from "./catalogue-helpers";
import {
  DEFAULT_PRICING_BOUNDS,
  type CatalogueCellEdit,
  type PricingBoundsConfig,
} from "./types";
import { PriceFieldInput } from "./price-field-input";

interface PricingCellProps {
  item: HouseCatalogueItemRecord;
  edit?: CatalogueCellEdit;
  commissionBps?: number | null;
  bounds?: PricingBoundsConfig;
  onChange: (edit: CatalogueCellEdit) => void;
  onKeyDownNavigation?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  isMobileLayout?: boolean;
}

export function PricingCell({
  item,
  edit,
  commissionBps,
  bounds = DEFAULT_PRICING_BOUNDS,
  onChange,
  onKeyDownNavigation,
  isMobileLayout = false,
}: PricingCellProps) {
  const t = useTranslations("house.catalogue");

  const isOffered = edit !== undefined ? edit.isActive : item.isActive;
  const currentPrice = edit !== undefined ? edit.price : item.price;
  const isDirty = isCellDirty(item, edit);

  function handleToggleOffered(nextActive: boolean) {
    let nextPrice = currentPrice;

    if (nextActive) {
      if (!nextPrice || nextPrice <= 0) {
        nextPrice = item.price > 0 ? item.price : 1000;
      }
    }

    const effectivePrice =
      nextPrice && nextPrice > 0 ? nextPrice : item.price > 0 ? item.price : 1000;

    onChange({
      isActive: nextActive,
      price: effectivePrice,
    });
  }

  const netPayout =
    isOffered && currentPrice && currentPrice > 0
      ? calculateNetPayout(currentPrice, commissionBps)
      : null;

  const isOutlier =
    isOffered &&
    currentPrice &&
    currentPrice > 0 &&
    isOutlierChange(item.price, currentPrice, bounds);

  const ariaLabel = t("priceFieldAria", {
    item: item.itemNameFr,
    fabric: item.fabricNameFr,
    service: item.serviceNameFr,
  });

  return (
    <div
      className={`relative p-2.5 rounded-xl transition ${
        isDirty ? "bg-primary/5 ring-1 ring-primary/30" : "hover:bg-muted/40"
      } ${isMobileLayout ? "w-full" : "min-w-[170px]"}`}
    >
      {/* Dirty indicator */}
      {isDirty && (
        <Badge
          className="absolute -top-1.5 -right-1.5 px-1.5 py-0 h-4 bg-primary text-primary-foreground text-[10px] font-bold flex items-center gap-1 shadow-xs border-0"
          title={t("dirtyTag")}
        >
          <Pencil className="size-2.5" aria-hidden="true" />
          <span>{t("dirtyTag")}</span>
        </Badge>
      )}

      {/* Switch + Label */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5 cursor-pointer">
          <Switch
            checked={isOffered}
            onCheckedChange={handleToggleOffered}
            aria-label={`${t("offeredSwitch")}, ${item.fabricNameFr}`}
          />
          <span className={`text-[11px] ${isOffered ? "font-bold text-heading" : "text-muted-foreground"}`}>
            {isOffered ? t("offered") : t("notOffered")}
          </span>
        </label>

        {isOutlier && (
          <span className="text-warning" title={t("outlierWarning")} aria-label={t("outlierWarning")}>
            <AlertTriangle className="size-3.5" />
          </span>
        )}
      </div>

      {/* Price input with CDF suffix */}
      {isOffered ? (
        <div className="space-y-1">
          <PriceFieldInput
            price={currentPrice}
            initialPrice={item.price}
            bounds={bounds}
            ariaLabel={ariaLabel}
            onCommitPrice={(px) => onChange({ isActive: true, price: px })}
            onRevertPrice={() =>
              onChange({ isActive: item.isActive, price: item.price > 0 ? item.price : null })
            }
            onKeyDownNavigation={onKeyDownNavigation}
          />

          {netPayout !== null && (
            <div className="text-[10.5px] text-success text-right font-bold font-mono tracking-tight">
              {t("youReceive", { amount: formatMoney(netPayout, "CDF") })}
            </div>
          )}
        </div>
      ) : (
        <div className="h-8 flex items-center justify-center font-mono text-xs text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-border/60 select-none">
          {t("emptyCellValue")}
        </div>
      )}
    </div>
  );
}
