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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-50">
      <div className="bg-card rounded-3xl p-6 sm:p-7 max-w-md w-full border border-border shadow-2xl relative animate-in zoom-in-95">
        <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
          <AlertTriangle className="size-6" />
        </div>

        <h4 className="text-lg font-black text-heading mb-2">
          {t("switchWarningTitle")}
        </h4>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
          {t("switchWarningDesc", {
            currentHouse: currentHouseName || "votre pressing actuel",
            newHouse: pendingSwitch.houseName,
          })}
        </p>

        <div className="flex flex-col sm:flex-row gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={cancelSwitchHouse}
            className="w-full sm:w-auto"
          >
            {t("cancelSwitch")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={confirmSwitchHouse}
            className="w-full sm:w-auto font-bold"
          >
            {t("confirmSwitch")}
          </Button>
        </div>
      </div>
    </div>
  );
}
