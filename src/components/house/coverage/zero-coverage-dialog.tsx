"use client";

import { useTranslations } from "next-intl";
import { AlertOctagon } from "lucide-react";
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

interface ZeroCoverageDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function ZeroCoverageDialog({
  isOpen,
  onConfirm,
  onCancel,
  isSaving,
}: ZeroCoverageDialogProps) {
  const t = useTranslations("house.coverage");

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && !isSaving && onCancel()}>
      <AlertDialogContent className="sm:max-w-md border-destructive/30">
        <AlertDialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl flex items-center justify-center bg-destructive text-destructive-foreground shrink-0">
              <AlertOctagon className="size-4" aria-hidden="true" />
            </div>
            <AlertDialogTitle className="text-sm font-bold text-destructive font-display">
              {t("zeroCoverageWarningTitle")}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-3 pt-2 text-left">
              <div className="p-3 bg-destructive-soft border border-destructive/20 rounded-xl text-xs text-destructive leading-relaxed">
                {t("zeroCoverageWarningDesc")}
              </div>

              <p className="text-xs text-muted-foreground">
                {t("zeroCoverageWarningExplanation")}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="pt-2 flex flex-row items-center justify-end gap-2">
          <AlertDialogCancel
            onClick={onCancel}
            disabled={isSaving}
            className="flex-1 sm:flex-initial text-xs font-semibold rounded-xl h-10 sm:h-9 px-4 cursor-pointer mt-0"
          >
            {t("cancelChanges")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isSaving}
            className="flex-1 sm:flex-initial text-xs font-bold rounded-xl h-10 sm:h-9 px-4 bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-xs cursor-pointer"
          >
            {isSaving ? t("saving") : t("confirmZeroCoverageAction")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
