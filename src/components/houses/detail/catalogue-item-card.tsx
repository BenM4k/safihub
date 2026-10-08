"use client";

import { Minus, Plus, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CustomerHouseCatalogueItem } from "@/dal";

interface CatalogueItemCardProps {
  item: CustomerHouseCatalogueItem;
  quantityInCart: number;
  onUpdateQuantity: (delta: number) => void;
}

export function CatalogueItemCard({
  item,
  quantityInCart,
  onUpdateQuantity,
}: CatalogueItemCardProps) {
  const t = useTranslations("customerHouses");
  const isUsd = item.currency === "USD";
  const formattedPrice = isUsd
    ? `$${item.priceCdf}`
    : `${item.priceCdf.toLocaleString("fr-FR")} CDF`;
  const priceUsdApprox = isUsd
    ? null
    : (item.priceCdf / 2800).toFixed(2);

  return (
    <div
      className={`rounded-2xl border p-4 flex flex-col justify-between transition-all ${
        item.isExcluded
          ? "bg-slate-50 border-slate-200/60 opacity-60"
          : quantityInCart > 0
            ? "bg-primary-soft/10 border-primary shadow-xs"
            : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs"
      }`}
    >
      <div>
        {/* Badges row: Service & Fabric */}
        <div className="flex items-center gap-1.5 flex-wrap mb-2">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
            {item.serviceNameFr}
          </span>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-50 border border-slate-200/80 text-slate-500">
            {item.fabricNameFr}
          </span>
        </div>

        {/* Item Name */}
        <h3 className="text-sm font-bold text-slate-900 leading-snug mb-1">
          {item.itemNameFr}
        </h3>

        {/* Price display */}
        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="text-base font-black text-slate-900 tabular-nums">
            {formattedPrice}
          </span>
          {priceUsdApprox && (
            <span className="text-xs text-slate-400">
              (≈ ${priceUsdApprox})
            </span>
          )}
        </div>
      </div>

      {/* Action / Stepper or Excluded Notice */}
      <div className="pt-3 border-t border-slate-100 mt-2">
        {item.isExcluded ? (
          <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-600">
            <AlertCircle className="size-3.5 shrink-0" />
            <span className="truncate">{item.exclusionNote || t("itemExcluded")}</span>
          </div>
        ) : quantityInCart > 0 ? (
          <div className="flex items-center justify-between bg-white border border-primary/30 rounded-xl p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => onUpdateQuantity(-1)}
              className="size-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center transition active:scale-95"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="text-sm font-black text-primary tabular-nums">
              {quantityInCart}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(1)}
              className="size-7 rounded-lg bg-primary hover:bg-primary-hover text-white flex items-center justify-center transition active:scale-95"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onUpdateQuantity(1)}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-primary hover:text-white hover:border-primary text-xs font-bold text-slate-700 transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-98"
          >
            <Plus className="size-3.5" />
            <span>{t("addToCart")}</span>
          </button>
        )}
      </div>
    </div>
  );
}
