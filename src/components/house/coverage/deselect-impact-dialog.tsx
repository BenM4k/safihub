"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeselectImpactDialogProps {
  isOpen: boolean;
  neighborhoodName: string;
  activeOrdersCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeselectImpactDialog({
  isOpen,
  neighborhoodName,
  activeOrdersCount,
  onConfirm,
  onCancel,
}: DeselectImpactDialogProps) {
  const t = useTranslations("house.coverage");

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="impact-dialog-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md bg-card rounded-2xl shadow-lift border border-border overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-border flex items-center justify-between bg-surface">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl flex items-center justify-center bg-warning-soft text-warning border border-warning/30">
              <AlertTriangle className="size-4" aria-hidden="true" />
            </div>
            <h2 id="impact-dialog-title" className="text-sm font-bold text-heading font-display">
              {t("activeOrdersImpactTitle")}
            </h2>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 text-muted-foreground hover:text-heading rounded-lg hover:bg-muted transition"
            aria-label="Fermer"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-3 bg-warning-soft border border-warning/30 rounded-xl flex items-start gap-3">
            <Clock className="size-4 text-warning mt-0.5 shrink-0" />
            <div className="space-y-1 text-xs">
              <span className="font-bold text-heading">
                {activeOrdersCount} {activeOrdersCount > 1 ? "commandes en cours" : "commande en cours"}
              </span>
              <p className="text-foreground leading-relaxed">
                {t("activeOrdersImpactDesc", {
                  count: activeOrdersCount,
                  neighborhood: neighborhoodName,
                })}
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Confirmez-vous le retrait du quartier <strong className="text-heading">« {neighborhoodName} »</strong> de votre zone de couverture ?
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="text-xs font-semibold rounded-xl min-h-[40px] px-4"
            >
              {t("cancelChanges")}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onConfirm}
              className="text-xs font-bold rounded-xl min-h-[40px] px-4 bg-warning hover:bg-warning/90 text-white shadow-xs"
            >
              Confirmer le retrait
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
