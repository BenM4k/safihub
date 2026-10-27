"use client";

import { useState } from "react";
import { AlertCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

/**
 * Order rejection modal dialog using shadcn Dialog, Textarea, and Button primitives.
 */
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

  function handleConfirm() {
    const finalReason =
      selectedPreset === "Autre motif" && customText.trim()
        ? customText.trim()
        : selectedPreset;
    onConfirm(finalReason);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md rounded-3xl bg-card border-border p-6 space-y-4">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-destructive-soft text-destructive flex items-center justify-center shrink-0">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <DialogTitle className="font-display font-black text-base text-heading text-left">
                {t("rejectModalTitle")} ({orderCode})
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground text-left">
                {t("rejectModalDesc")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Alert className="py-2.5 bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-200">
          <AlertCircle className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <AlertDescription className="text-xs leading-relaxed">
            {t("rejectWarningRate")}
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label className="text-xs font-bold text-heading block">
            {t("rejectReasonLabel")}
          </Label>
          <div className="grid gap-2">
            {PRESET_REASONS.map((reason) => (
              <label
                key={reason}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-medium cursor-pointer transition ${
                  selectedPreset === reason
                    ? "bg-primary-soft/60 text-heading font-semibold"
                    : "text-foreground hover:bg-muted/40"
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
            <Textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder={t("rejectReasonPlaceholder")}
              rows={2}
              className="w-full mt-2 text-xs"
            />
          )}
        </div>

        <DialogFooter className="flex flex-row items-center justify-end gap-2.5 pt-3 border-t border-border sm:space-x-0">
          <Button
            type="button"
            variant="ghost"
            disabled={isPending}
            onClick={handleClose}
            className="flex-1 sm:flex-initial text-xs font-semibold cursor-pointer h-10 sm:h-9"
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={
              isPending ||
              (selectedPreset === "Autre motif" && !customText.trim())
            }
            onClick={handleConfirm}
            className="flex-1 sm:flex-initial text-xs font-bold text-white min-w-[130px] cursor-pointer h-10 sm:h-9"
          >
            {isPending ? (
              <>
                <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                {t("rejecting")}
              </>
            ) : (
              t("confirmReject")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
