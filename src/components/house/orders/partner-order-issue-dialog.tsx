"use client";

import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PartnerOrderListItemDTO } from "@/dal/partner-order.dal";

interface PartnerOrderIssueDialogProps {
  order: PartnerOrderListItemDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (orderId: string, reason: string, note?: string) => Promise<void>;
}

const PRESET_REASONS = [
  "Tache indélébile pré-existante constatée",
  "Vêtement déchiré ou boutons manquants à la réception",
  "Article absent du sac de collecte",
  "Décompte physique incompatible avec la déclaration",
  "Autre incident survenu à l'atelier",
] as const;

export function PartnerOrderIssueDialog({
  order,
  isOpen,
  onClose,
  onConfirm,
}: PartnerOrderIssueDialogProps) {
  const t = useTranslations("house.orders");
  const [selectedReason, setSelectedReason] = useState<string>(PRESET_REASONS[0]);
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [prevOrderId, setPrevOrderId] = useState(order?.id);
  if (order?.id !== prevOrderId) {
    setPrevOrderId(order?.id);
    setSelectedReason(PRESET_REASONS[0]);
    setDetails("");
    setErrorMsg(null);
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setSelectedReason(PRESET_REASONS[0]);
      setDetails("");
      setErrorMsg(null);
      onClose();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!order) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onConfirm(order.id, selectedReason, details.trim() || undefined);
      handleOpenChange(false);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erreur lors de la transmission du signalement.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertCircle className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-heading">
                {t("issueModalTitle")}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {t("orderCodeLabel", { code: order.shortReference })}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-foreground">
              {t("issueReasonLabel")}
            </Label>
            <div className="space-y-1.5">
              {PRESET_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    selectedReason === reason
                      ? "bg-muted/60 text-heading font-semibold"
                      : "text-foreground hover:bg-muted/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="issueReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="text-primary focus:ring-primary h-4 w-4"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="issue-details" className="text-xs font-semibold text-foreground">
              {t("issueDetailsLabel")}
            </Label>
            <Textarea
              id="issue-details"
              rows={2}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={t("issueDetailsPlaceholder")}
              className="text-xs resize-none"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-destructive font-medium">{errorMsg}</p>
          )}

          <DialogFooter className="flex flex-row items-center justify-end gap-2.5 pt-3 border-t border-border sm:space-x-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial text-xs font-semibold cursor-pointer h-10 sm:h-9"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer h-10 sm:h-9"
            >
              {isSubmitting && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
              <span>{t("confirmIssue")}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
