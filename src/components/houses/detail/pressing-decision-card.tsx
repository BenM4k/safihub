"use client";

import { Clock, ShieldAlert, ShoppingBag, ArrowRight, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { formatAmount } from "@/lib/order-formatters";

interface PressingDecisionCardProps {
  turnaroundHours: number;
  minimumOrderAmount: number;
  subtotalCdf: number;
  totalItemsCount: number;
  isPaused: boolean;
  isOpenNow: boolean;
  deliveryFee: number | null;
  neighborhoodName?: string | null;
  onProceedOrder: () => void;
}

export function PressingDecisionCard({
  turnaroundHours,
  minimumOrderAmount,
  subtotalCdf,
  totalItemsCount,
  isPaused,
  isOpenNow,
  deliveryFee,
  neighborhoodName,
  onProceedOrder,
}: PressingDecisionCardProps) {
  const t = useTranslations("customerHouses");

  const isMinOrderReached = subtotalCdf >= minimumOrderAmount;
  const remainingCdf = Math.max(0, minimumOrderAmount - subtotalCdf);
  const progressPercent =
    minimumOrderAmount > 0
      ? Math.min(100, Math.round((subtotalCdf / minimumOrderAmount) * 100))
      : 100;

  const canOrder = !isPaused && isMinOrderReached && totalItemsCount > 0;

  return (
    <div className="sticky top-20 bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm space-y-5">
      <div>
        <h2 className="text-base font-black text-slate-900 tracking-tight mb-1">
          {t("decisionCardTitle")}
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Délai et conditions de prise en charge à Bukavu.
        </p>
      </div>

      {/* SLA & Delivery Snapshot */}
      <div className="space-y-3 pt-1">
        {/* Turnaround Guarantee */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2.5">
            <Clock className="size-4 text-primary shrink-0" />
            <span className="text-xs font-semibold text-slate-700">Délai estimé</span>
          </div>
          <span className="text-xs font-black text-slate-900">
            {t("readyInHours", { hours: turnaroundHours })}
          </span>
        </div>

        {/* Minimum Order */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
          <span className="text-xs font-semibold text-slate-700">Minimum de commande</span>
          <span className="text-xs font-black text-slate-900">
            {formatAmount(minimumOrderAmount)}
          </span>
        </div>

        {/* Delivery Fee for selected neighborhood */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2">
            <Truck className="size-4 text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-700">
              Livraison ({neighborhoodName || "Zone"})
            </span>
          </div>
          <span className="text-xs font-black text-slate-900">
            {deliveryFee !== null ? formatAmount(deliveryFee) : "—"}
          </span>
        </div>
      </div>

      {/* Cart Summary & Minimum order progress */}
      <div className="pt-2 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-600">Articles sélectionnés</span>
          <span className="font-black text-slate-900">{totalItemsCount}</span>
        </div>

        <div className="flex items-baseline justify-between">
          <span className="text-xs font-semibold text-slate-600">Sous-total</span>
          <span className="text-lg font-black text-slate-900 tabular-nums">
            {formatAmount(subtotalCdf)}
          </span>
        </div>

        {/* Progress bar towards minimum order */}
        {minimumOrderAmount > 0 && !isMinOrderReached && totalItemsCount > 0 && (
          <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
              <span>{t("minOrderRemaining", { amount: formatAmount(remainingCdf) })}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full bg-amber-200/60 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Paused or closed notice */}
      {isPaused ? (
        <div className="flex items-start gap-2 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
          <ShieldAlert className="size-4 shrink-0 text-amber-600 mt-0.5" />
          <span>{t("pausedBannerText")}</span>
        </div>
      ) : !isOpenNow ? (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-100 text-slate-700 text-xs font-medium">
          <Clock className="size-4 shrink-0 text-slate-500" />
          <span>Fermé actuellement · Traité dès réouverture</span>
        </div>
      ) : null}

      {/* CTA Button */}
      <Button
        type="button"
        variant="primary"
        size="lg"
        disabled={!canOrder}
        onClick={onProceedOrder}
        className="w-full py-3.5 rounded-2xl font-black text-sm gap-2 shadow-sm transition active:scale-98"
      >
        <ShoppingBag className="size-4" />
        <span>{t("orderNow")}</span>
        <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}
