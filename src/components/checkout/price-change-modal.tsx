"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface PriceChangeModalProps {
  isOpen: boolean;
  details?: Record<string, unknown>;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PriceChangeModal({
  isOpen,
  details,
  onConfirm,
  onCancel,
}: PriceChangeModalProps) {
  const t = useTranslations("checkout");

  if (!isOpen) return null;

  const oldPrice = Number(details?.oldPrice || 0);
  const newPrice = Number(details?.newPrice || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl relative animate-in zoom-in-95">
        <div className="size-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
          <AlertTriangle className="size-6" />
        </div>

        <h4 className="text-lg font-black text-slate-900 mb-2">
          {t("priceConfirmationNeeded")}
        </h4>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 mb-6">
          <p className="text-slate-500">
            {t("priceOld", { amount: oldPrice.toLocaleString("fr-FR") })}
          </p>
          <p className="text-slate-900 font-bold text-sm">
            {t("priceNew", { amount: newPrice.toLocaleString("fr-FR") })}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onConfirm}
            className="w-full sm:w-auto font-bold"
          >
            Confirmer le nouveau tarif
          </Button>
        </div>
      </div>
    </div>
  );
}
