"use client";

import { useState, useMemo } from "react";
import { Minus, Plus, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatAmount } from "@/lib/order-formatters";
import { GarmentIcon } from "@/components/common/garment-icon";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CustomerHouseCatalogueItem } from "@/dal";

interface PressingArticleCardProps {
  itemName: string;
  itemCategory?: string | null;
  serviceName: string;
  variants: CustomerHouseCatalogueItem[];
  activeFabricId?: string | null;
  getQuantityInCart: (houseItemId: string) => number;
  onUpdateQuantity: (item: CustomerHouseCatalogueItem, delta: number) => void;
  isHouseAvailable: boolean;
  usdExchangeRate?: number | null;
}

export function PressingArticleCard({
  itemName,
  itemCategory,
  serviceName,
  variants,
  activeFabricId,
  getQuantityInCart,
  onUpdateQuantity,
  isHouseAvailable,
  usdExchangeRate,
}: PressingArticleCardProps) {
  const t = useTranslations("customerHouses");

  const sortedVariants = useMemo(() => {
    return [...variants].sort((a, b) => a.priceCdf - b.priceCdf);
  }, [variants]);

  const [manualVariantId, setManualVariantId] = useState<string | null>(null);

  const selectedItem = useMemo(() => {
    if (manualVariantId) {
      const found = sortedVariants.find(
        (v) => v.houseItemId === manualVariantId,
      );
      if (found) return found;
    }
    if (activeFabricId) {
      const matchingFabric = sortedVariants.find(
        (v) => v.fabricId === activeFabricId && !v.isExcluded,
      );
      if (matchingFabric) return matchingFabric;
    }
    return sortedVariants.find((v) => !v.isExcluded) ?? sortedVariants[0];
  }, [manualVariantId, activeFabricId, sortedVariants]);

  const quantityInCart = selectedItem
    ? getQuantityInCart(selectedItem.houseItemId)
    : 0;
  const totalArticleCount = sortedVariants.reduce(
    (sum, v) => sum + getQuantityInCart(v.houseItemId),
    0,
  );

  const currentPrice = selectedItem?.priceCdf ?? 0;
  const priceUsdApprox =
    usdExchangeRate && usdExchangeRate > 0
      ? (currentPrice / usdExchangeRate).toFixed(2)
      : null;

  const isExcluded = Boolean(selectedItem?.isExcluded);
  const hasAnyInCart = totalArticleCount > 0;

  return (
    <div
      className={`rounded-2xl border p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 transition-all duration-200 bg-card ${
        isExcluded
          ? "border-border/60 opacity-65 bg-muted/30 shadow-xs"
          : hasAnyInCart
            ? "border-primary/80 ring-1 ring-primary/20 shadow-[0_6px_20px_-4px_rgba(40,36,213,0.16),0_2px_6px_-1px_rgba(16,24,40,0.06)] dark:shadow-[0_6px_20px_-4px_rgba(40,36,213,0.35),0_2px_6px_-1px_rgba(0,0,0,0.4)]"
            : "border-border/80 shadow-[0_2px_10px_-2px_rgba(16,24,40,0.08),0_1px_3px_rgba(16,24,40,0.05)] hover:border-border-strong hover:shadow-[0_10px_24px_-4px_rgba(16,24,40,0.12),0_4px_8px_-2px_rgba(16,24,40,0.06)] dark:shadow-[0_2px_10px_-2px_rgba(0,0,0,0.35),0_1px_3px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_10px_24px_-4px_rgba(0,0,0,0.5)]"
      }`}
    >
      {/* Left: Noticeable Garment Icon + Item Identity & Price */}
      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
        <div className="relative shrink-0">
          <GarmentIcon
            name={itemName}
            category={itemCategory}
            size="lg"
            className={hasAnyInCart ? "ring-2 ring-primary/30" : undefined}
          />
          {hasAnyInCart && (
            <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-primary text-white text-[10px] font-semibold flex items-center justify-center shadow-xs tabular-nums">
              {totalArticleCount}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm sm:text-[15px] font-semibold text-heading leading-snug truncate">
              {itemName}
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-secondary text-muted-foreground border border-border/40 shrink-0">
              {serviceName}
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm sm:text-[15px] font-semibold text-heading tabular-nums">
              {formatAmount(currentPrice)}
            </span>
            {priceUsdApprox && (
              <span className="text-xs text-muted-foreground font-normal">
                (≈ ${priceUsdApprox})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Fabric/Type Selector + Item Count Stepper */}
      <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-border/60 shrink-0">
        {/* Type / Fabric Selector */}
        {sortedVariants.length > 1 && selectedItem ? (
          <Select
            value={selectedItem.houseItemId}
            onValueChange={(val: string) => setManualVariantId(val)}
          >
            <SelectTrigger
              aria-label={`${t("selectMaterial")} ${itemName}`}
              className="h-9 min-w-[130px] max-w-[175px] px-3 rounded-xl bg-muted/60 hover:bg-muted border border-input text-xs font-medium text-foreground cursor-pointer"
            >
              <SelectValue>{selectedItem.fabricNameFr}</SelectValue>
            </SelectTrigger>
            <SelectContent align="end">
              <SelectGroup>
                {sortedVariants.map((v) => {
                  const variantQty = getQuantityInCart(v.houseItemId);
                  return (
                    <SelectItem
                      key={v.houseItemId}
                      value={v.houseItemId}
                      className="text-xs font-medium"
                    >
                      <span className="flex items-center justify-between gap-3 w-full">
                        <span
                          className={
                            v.isExcluded
                              ? "line-through text-muted-foreground"
                              : ""
                          }
                        >
                          {v.fabricNameFr}
                          {variantQty > 0 ? ` (${variantQty})` : ""}
                        </span>
                        <span className="text-[11px] text-muted-foreground tabular-nums">
                          {formatAmount(v.priceCdf)}
                        </span>
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
        ) : selectedItem ? (
          <span className="px-2.5 py-1.5 rounded-xl bg-muted/60 border border-border/50 text-xs font-medium text-muted-foreground truncate max-w-[150px]">
            {selectedItem.fabricNameFr}
          </span>
        ) : null}

        {/* Item Count Stepper or Exclusion Notice */}
        {isExcluded ? (
          <div className="flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 max-w-[160px]">
            <AlertCircle className="size-4 shrink-0" />
            <span className="truncate">
              {selectedItem?.exclusionNote || t("itemExcluded")}
            </span>
          </div>
        ) : selectedItem ? (
          <div
            className={`flex items-center gap-1 rounded-xl border p-1 transition ${
              quantityInCart > 0
                ? "bg-primary/5 border-primary/40 shadow-2xs"
                : "bg-muted/40 border-border"
            }`}
          >
            <button
              type="button"
              disabled={!isHouseAvailable || quantityInCart <= 0}
              onClick={() => onUpdateQuantity(selectedItem, -1)}
              aria-label={`Diminuer la quantité de ${itemName} (${selectedItem.fabricNameFr})`}
              className="size-8 rounded-lg bg-card hover:bg-secondary disabled:opacity-40 disabled:pointer-events-none text-foreground flex items-center justify-center transition active:scale-95 cursor-pointer border border-border/50"
            >
              <Minus className="size-3.5" />
            </button>
            <span
              className={`min-w-7 text-center text-sm font-semibold tabular-nums ${
                quantityInCart > 0 ? "text-primary" : "text-muted-foreground"
              }`}
              aria-live="polite"
              aria-atomic="true"
            >
              {quantityInCart}
            </span>
            <button
              type="button"
              disabled={!isHouseAvailable}
              onClick={() => onUpdateQuantity(selectedItem, 1)}
              aria-label={`Augmenter la quantité de ${itemName} (${selectedItem.fabricNameFr})`}
              className="size-8 rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:pointer-events-none text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
