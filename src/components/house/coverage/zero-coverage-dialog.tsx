"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { AlertOctagon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccessibleDialog } from "@/components/house/orders/use-accessible-dialog";

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
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const containerRef = useAccessibleDialog<HTMLDivElement>({
    isOpen,
    onClose: onCancel,
    initialFocusRef: closeButtonRef,
    trapTab: true,
  });

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="zero-coverage-dialog-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        ref={containerRef}
        tabIndex={-1}
        className="w-full max-w-md bg-card rounded-2xl shadow-lift border border-destructive/30 overflow-hidden animate-in zoom-in-95 duration-150 outline-none"
      >
        <div className="p-4 border-b border-border flex items-center justify-between bg-destructive-soft">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl flex items-center justify-center bg-destructive text-destructive-foreground">
              <AlertOctagon className="size-4" aria-hidden="true" />
            </div>
            <h2
              id="zero-coverage-dialog-title"
              className="text-sm font-bold text-destructive font-display"
            >
              {t("zeroCoverageWarningTitle")}
            </h2>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="p-1.5 text-muted-foreground hover:text-heading rounded-lg hover:bg-muted transition cursor-pointer"
            aria-label={t("closeDialog")}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-3 bg-destructive-soft border border-destructive/20 rounded-xl text-xs text-destructive leading-relaxed">
            {t("zeroCoverageWarningDesc")}
          </div>

          <p className="text-xs text-muted-foreground">
            {t("zeroCoverageWarningExplanation")}
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isSaving}
              className="text-xs font-semibold rounded-xl min-h-[40px] px-4 cursor-pointer"
            >
              {t("cancelChanges")}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onConfirm}
              disabled={isSaving}
              className="text-xs font-bold rounded-xl min-h-[40px] px-4 bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-xs cursor-pointer"
            >
              {isSaving ? t("saving") : t("confirmZeroCoverageAction")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
