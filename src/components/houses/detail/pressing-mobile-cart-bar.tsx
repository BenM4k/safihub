"use client";

import { ShoppingBag, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { formatAmount } from "@/lib/order-formatters";

interface PressingMobileCartBarProps {
  totalItemsCount: number;
  subtotalCdf: number;
  minimumOrderAmount: number;
  onProceedOrder: () => void;
  houseName: string;
}

export function PressingMobileCartBar({
  totalItemsCount,
  subtotalCdf,
  minimumOrderAmount,
  onProceedOrder,
  houseName,
}: PressingMobileCartBarProps) {
  const t = useTranslations("customerHouses");
  const isMinOrderReached = subtotalCdf >= minimumOrderAmount;
  const remainingCdf = Math.max(0, minimumOrderAmount - subtotalCdf);
  const progressPercent =
    minimumOrderAmount > 0
      ? Math.min(100, Math.round((subtotalCdf / minimumOrderAmount) * 100))
      : 100;

  if (totalItemsCount === 0) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-2xl animate-in slide-in-from-bottom duration-300">
      {/* Minimum order progress ribbon if not reached */}
      {minimumOrderAmount > 0 && !isMinOrderReached && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2">
          <div className="flex items-center justify-between gap-2 text-xs text-amber-700 dark:text-amber-300">
            <span className="font-semibold text-[11px]">
              {t("minOrderRemaining", {
                amount: formatAmount(remainingCdf),
              })}
            </span>
            <div className="w-24 bg-amber-500/20 rounded-full h-1.5 overflow-hidden shrink-0">
              <div
                className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Bar */}
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="size-10 rounded-2xl bg-primary-soft text-primary flex items-center justify-center relative shrink-0">
            <ShoppingBag className="size-5" />
            <span className="absolute -top-1 -right-1 size-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center animate-in zoom-in-50 duration-150">
              {totalItemsCount}
            </span>
          </div>

          <div className="min-w-0">
            <span className="text-base font-black text-heading tabular-nums block truncate">
              {formatAmount(subtotalCdf)}
            </span>
            <span className="text-[11px] text-muted-foreground font-medium block truncate">
              {t("cartBarItems", { count: totalItemsCount })} · {houseName}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={onProceedOrder}
          disabled={!isMinOrderReached}
          className="px-4 py-2.5 rounded-xl font-black text-xs gap-1.5 shrink-0 shadow-sm press hover-lift"
        >
          <span>{t("orderNow")}</span>
          <ArrowRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
