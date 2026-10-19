"use client";

import { useState, useMemo } from "react";
import { Minus, Plus, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatAmount } from "@/lib/order-formatters";
import type { CustomerHouseCatalogueItem } from "@/dal";


interface PressingArticleCardProps {
  itemName: string;
  serviceName: string;
  variants: CustomerHouseCatalogueItem[];
  getQuantityInCart: (houseItemId: string) => number;
  onUpdateQuantity: (item: CustomerHouseCatalogueItem, delta: number) => void;
  isHouseAvailable: boolean;
  usdExchangeRate?: number | null;
}

export function PressingArticleCard({
  itemName,
  serviceName,
  variants,
  getQuantityInCart,
  onUpdateQuantity,
  isHouseAvailable,
  usdExchangeRate,
}: PressingArticleCardProps) {
  const t = useTranslations("customerHouses");

  // Sorted variants
  const sortedVariants = useMemo(() => {
    return [...variants].sort((a, b) => a.priceCdf - b.priceCdf);
  }, [variants]);

  // Default selected variant: first non-excluded variant
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(() => {
    const nonExcludedIdx = sortedVariants.findIndex((v) => !v.isExcluded);
    return nonExcludedIdx >= 0 ? nonExcludedIdx : 0;
  });

  const selectedItem = sortedVariants[selectedVariantIndex] || sortedVariants[0];
  const quantityInCart = selectedItem ? getQuantityInCart(selectedItem.houseItemId) : 0;

  const minPrice = sortedVariants.length > 0 ? sortedVariants[0].priceCdf : 0;
  const currentPrice = selectedItem ? selectedItem.priceCdf : minPrice;

  const priceUsdApprox =
    usdExchangeRate && usdExchangeRate > 0
      ? (currentPrice / usdExchangeRate).toFixed(2)
      : null;

  return (
    <div
      className={`rounded-3xl border p-4 sm:p-5 flex flex-col justify-between transition-all bg-white ${
        selectedItem?.isExcluded
          ? "border-slate-200/60 opacity-60 bg-slate-50/50"
          : quantityInCart > 0
            ? "border-primary shadow-xs ring-1 ring-primary/20"
            : "border-slate-200 hover:border-slate-300 hover:shadow-2xs"
      }`}
    >
      <div>
        {/* Top badges: Service & Min price indicator */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
            {serviceName}
          </span>
          {sortedVariants.length > 1 && (
            <span className="text-[10px] text-slate-400 font-medium">
              {t("fromPrice", { price: formatAmount(minPrice) })}
            </span>
          )}
        </div>

        {/* Item Name */}
        <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug mb-3">
          {itemName}
        </h3>

        {/* Material / Fabric Selector */}
        {sortedVariants.length > 1 && (
          <div className="mb-4">
            <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
              {t("selectMaterial")}
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {sortedVariants.map((v, idx) => {
                const isSelected = idx === selectedVariantIndex;
                return (
                  <button
                    key={v.houseItemId}
                    type="button"
                    onClick={() => setSelectedVariantIndex(idx)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isSelected
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {v.fabricNameFr}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Price display */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-base sm:text-lg font-black text-slate-900 tabular-nums">
            {formatAmount(currentPrice)}
          </span>
          {priceUsdApprox && (
            <span className="text-xs text-slate-400 font-medium">
              (≈ ${priceUsdApprox})
            </span>
          )}
        </div>
      </div>

      {/* Action / Stepper / Exclusion Notice */}
      <div className="pt-3 border-t border-slate-100">
        {selectedItem?.isExcluded ? (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
            <AlertCircle className="size-4 shrink-0" />
            <span className="truncate">
              {selectedItem.exclusionNote || t("itemExcluded")}
            </span>
          </div>
        ) : !isHouseAvailable ? (
          <button
            type="button"
            disabled
            className="w-full py-2.5 px-3 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed"
          >
            {t("addToCart")}
          </button>
        ) : quantityInCart > 0 ? (
          <div className="flex items-center justify-between bg-white border border-primary/40 rounded-2xl p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => onUpdateQuantity(selectedItem, -1)}
              aria-label={`Diminuer la quantité de ${itemName} (${selectedItem.fabricNameFr})`}
              className="size-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center transition active:scale-95 cursor-pointer"
            >
              <Minus className="size-4" />
            </button>
            <span
              className="text-sm font-black text-primary tabular-nums"
              aria-live="polite"
              aria-atomic="true"
            >
              {quantityInCart}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(selectedItem, 1)}
              aria-label={`Augmenter la quantité de ${itemName} (${selectedItem.fabricNameFr})`}
              className="size-8 rounded-xl bg-primary hover:bg-primary-hover text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
            >
              <Plus className="size-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onUpdateQuantity(selectedItem, 1)}
            className="w-full py-2.5 px-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-primary hover:text-white hover:border-primary text-xs font-bold text-slate-800 transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-98 cursor-pointer"
          >
            <Plus className="size-4" />
            <span>{t("addToCart")}</span>
          </button>
        )}
      </div>
    </div>
  );
}
