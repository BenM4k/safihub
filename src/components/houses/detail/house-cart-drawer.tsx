"use client";

import { ShoppingBag, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface HouseCartDrawerProps {
  totalItemsCount: number;
  subtotalCdf: number;
  minimumOrderAmount: number;
  onProceedOrder: () => void;
  houseName: string;
}

export function HouseCartDrawer({
  totalItemsCount,
  subtotalCdf,
  minimumOrderAmount,
  onProceedOrder,
  houseName,
}: HouseCartDrawerProps) {
  const t = useTranslations("customerHouses");
  const subtotalUsd = (subtotalCdf / 2800).toFixed(2);
  const isMinOrderReached = subtotalCdf >= minimumOrderAmount;
  const remainingCdf = Math.max(0, minimumOrderAmount - subtotalCdf);
  const progressPercent = minimumOrderAmount > 0
    ? Math.min(100, Math.round((subtotalCdf / minimumOrderAmount) * 100))
    : 100;

  if (totalItemsCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200/90 shadow-2xl animate-in slide-in-from-bottom-4">
      {/* Minimum order progress ribbon if min order is not yet reached */}
      {minimumOrderAmount > 0 && !isMinOrderReached && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs text-amber-900">
            <span className="font-semibold">
              {t("minOrderRemaining", {
                amount: remainingCdf.toLocaleString("fr-FR"),
              })}
            </span>
            <div className="w-full sm:w-48 bg-amber-200/80 rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Cart Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-2xl bg-primary-soft text-primary flex items-center justify-center relative">
            <ShoppingBag className="size-5" />
            <span className="absolute -top-1 -right-1 size-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center">
              {totalItemsCount}
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-slate-900 tabular-nums">
                {subtotalCdf.toLocaleString("fr-FR")} CDF
              </span>
              <span className="text-xs text-slate-500">
                (≈ ${subtotalUsd} USD)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {t("cartBarItems", { count: totalItemsCount })} · {houseName}
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={onProceedOrder}
            disabled={!isMinOrderReached}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm gap-2 shadow-sm"
          >
            <span>{t("orderNow")}</span>
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
