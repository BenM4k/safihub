"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, Clock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

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

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-md rounded-2xl bg-card border border-border shadow-lift p-4 sm:p-6 space-y-4 font-sans max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl flex items-center justify-center bg-warning/10 text-warning border border-warning/30 shrink-0">
              <AlertTriangle className="size-4" aria-hidden="true" />
            </div>
            <AlertDialogTitle className="text-sm font-bold text-foreground font-display">
              {t("activeOrdersImpactTitle")}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-3 pt-2 text-left">
              <div className="p-3 bg-warning/10 border border-warning/30 rounded-xl flex items-start gap-3">
                <Clock className="size-4 text-warning mt-0.5 shrink-0" />
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-foreground">
                    {t("activeOrdersCount", { count: activeOrdersCount })}
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
                {t("confirmDeselectPrompt", { neighborhood: neighborhoodName })}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="pt-2 flex flex-row items-center justify-end gap-2">
          <AlertDialogCancel
            onClick={onCancel}
            className="flex-1 sm:flex-initial text-xs font-semibold rounded-lg h-10 sm:h-9 px-4 cursor-pointer mt-0"
          >
            {t("cancelChanges")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="flex-1 sm:flex-initial text-xs font-bold rounded-lg h-10 sm:h-9 px-4 bg-warning hover:bg-warning/90 text-white shadow-xs cursor-pointer"
          >
            {t("confirmDeselectAction")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
