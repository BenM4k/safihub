"use client";

import { useState } from "react";
import { AlertCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useAccessibleDialog } from "@/components/house/orders/use-accessible-dialog";

interface OrderRejectDialogProps {
  isOpen: boolean;
  orderCode: string;
  isPending: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const PRESET_REASONS = [
  "Capacité atteinte",
  "Service indisponible",
  "Hors zone de prise en charge",
  "Autre motif",
];

export function OrderRejectDialog({
  isOpen,
  orderCode,
  isPending,
  onClose,
  onConfirm,
}: OrderRejectDialogProps) {
  const t = useTranslations("house.orders");
  const [selectedPreset, setSelectedPreset] = useState(PRESET_REASONS[0]);
  const [customText, setCustomText] = useState("");

  const [prevOrderCode, setPrevOrderCode] = useState(orderCode);
  if (orderCode !== prevOrderCode) {
    setPrevOrderCode(orderCode);
    setSelectedPreset(PRESET_REASONS[0]);
    setCustomText("");
  }

  function handleClose() {
    setSelectedPreset(PRESET_REASONS[0]);
    setCustomText("");
    onClose();
  }

  const containerRef = useAccessibleDialog<HTMLDivElement>({
    isOpen,
    onClose: handleClose,
  });

  if (!isOpen) return null;

  function handleConfirm() {
    const finalReason =
      selectedPreset === "Autre motif" && customText.trim()
        ? customText.trim()
        : selectedPreset;
    onConfirm(finalReason);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in font-sans"
    >
      <div
        ref={containerRef}
        tabIndex={-1}
        className="w-full max-w-md bg-card rounded-3xl p-6 space-y-4 shadow-2xl border border-border outline-none"
      >
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-2xl bg-destructive-soft text-destructive flex items-center justify-center shrink-0">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <h3 id="reject-dialog-title" className="font-display font-black text-base text-heading">
              {t("rejectModalTitle")} ({orderCode})
            </h3>
            <p className="text-xs text-muted-foreground">
              {t("rejectModalDesc")}
            </p>
          </div>
        </div>

        {/* Warning note regarding acceptance rate */}
        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 text-xs text-amber-900 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-200 flex items-start gap-2">
          <AlertCircle className="size-4 shrink-0 text-amber-600 mt-0.5" />
          <p className="leading-relaxed">
            {t("rejectWarningRate")}
          </p>
        </div>

        {/* Reason choices */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-heading block">
            {t("rejectReasonLabel")}
          </label>
          <div className="grid gap-2">
            {PRESET_REASONS.map((reason) => (
              <label
                key={reason}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium cursor-pointer transition ${
                  selectedPreset === reason
                    ? "bg-primary-soft border-primary text-heading font-semibold"
                    : "border-border text-foreground hover:bg-surface"
                }`}
              >
                <input
                  type="radio"
                  name="reject_reason"
                  value={reason}
                  checked={selectedPreset === reason}
                  onChange={() => setSelectedPreset(reason)}
                  className="accent-primary size-4 cursor-pointer"
                />
                <span>{reason}</span>
              </label>
            ))}
          </div>

          {selectedPreset === "Autre motif" && (
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder={t("rejectReasonPlaceholder")}
              rows={2}
              className="w-full mt-2 p-2.5 rounded-xl border border-border-strong text-xs text-foreground placeholder:text-muted-foreground focus:outline-primary"
            />
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            disabled={isPending}
            onClick={onClose}
            className="text-xs font-semibold"
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            disabled={isPending || (selectedPreset === "Autre motif" && !customText.trim())}
            onClick={handleConfirm}
            className="text-xs font-bold bg-destructive hover:bg-destructive/90 text-primary-foreground min-w-[120px]"
          >
            {isPending ? (
              <>
                <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                Refus en cours...
              </>
            ) : (
              t("confirmReject")
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
