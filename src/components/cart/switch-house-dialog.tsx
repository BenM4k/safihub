"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import { Button } from "@/components/ui/button";

export function SwitchHouseDialog() {
  const t = useTranslations("cart");
  const {
    showSwitchModal,
    houseName: currentHouseName,
    pendingSwitch,
    confirmSwitchHouse,
    cancelSwitchHouse,
  } = useCartStore();

  if (!showSwitchModal || !pendingSwitch) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-card rounded-2xl p-5 sm:p-6 w-full max-w-[calc(100%-2rem)] sm:max-w-md border border-border/60 shadow-lift relative animate-in zoom-in-95 font-sans">
        <div className="size-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3.5">
          <AlertTriangle className="size-5" />
        </div>

        <h4 className="text-base sm:text-lg font-black text-heading mb-1.5 font-display tracking-tight">
          {t("switchWarningTitle")}
        </h4>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
          {t("switchWarningDesc", {
            currentHouse: currentHouseName || "votre pressing actuel",
            newHouse: pendingSwitch.houseName,
          })}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-3 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            onClick={cancelSwitchHouse}
            className="w-full sm:w-auto h-9 px-4 rounded-lg text-xs font-semibold"
          >
            {t("cancelSwitch")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={confirmSwitchHouse}
            className="w-full sm:w-auto h-9 px-4 rounded-lg text-xs font-bold"
          >
            {t("confirmSwitch")}
          </Button>
        </div>
      </div>
    </div>
  );
}
