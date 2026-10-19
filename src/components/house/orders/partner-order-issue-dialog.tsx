"use client";

import { useRef, useState } from "react";
import { AlertCircle, Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { PartnerOrderListItemDTO } from "@/dal/partner-order.dal";
import { useAccessibleDialog } from "./use-accessible-dialog";

interface PartnerOrderIssueDialogProps {
  order: PartnerOrderListItemDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (orderId: string, reason: string, note?: string) => Promise<void>;
}

export function PartnerOrderIssueDialog({
  order,
  isOpen,
  onClose,
  onConfirm,
}: PartnerOrderIssueDialogProps) {
  const t = useTranslations("house.orders");
  const [selectedReason, setSelectedReason] = useState("Tache indélébile pré-existante constatée");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const initialRadioRef = useRef<HTMLInputElement>(null);

  const [prevOrderId, setPrevOrderId] = useState(order?.id);
  if (order?.id !== prevOrderId) {
    setPrevOrderId(order?.id);
    setSelectedReason("Tache indélébile pré-existante constatée");
    setDetails("");
    setErrorMsg(null);
  }

  function handleClose() {
    setSelectedReason("Tache indélébile pré-existante constatée");
    setDetails("");
    setErrorMsg(null);
    onClose();
  }

  const containerRef = useAccessibleDialog<HTMLDivElement>({
    isOpen,
    onClose: handleClose,
    initialFocusRef: initialRadioRef,
    trapTab: true,
  });

  if (!isOpen || !order) return null;

  const presetReasons = [
    "Tache indélébile pré-existante constatée",
    "Vêtement déchiré ou boutons manquants à la réception",
    "Article absent du sac de collecte",
    "Décompte physique incompatible avec la déclaration",
    "Autre incident survenu à l'atelier",
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onConfirm(order!.id, selectedReason, details.trim() || undefined);
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erreur lors de la transmission du signalement.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="issue-dialog-title"
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
    >
      <div
        ref={containerRef}
        tabIndex={-1}
        className="bg-card rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-border space-y-4 font-sans outline-none"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950">
              <AlertCircle className="size-5" />
            </div>
            <div>
              <h3 id="issue-dialog-title" className="text-base font-bold text-heading font-display">
                {t("issueModalTitle")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t("orderCodeLabel", { code: order.shortReference })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              {t("issueReasonLabel")}
            </label>
            <div className="space-y-1.5">
              {presetReasons.map((reason, idx) => (
                <label
                  key={reason}
                  className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-surface text-xs font-medium cursor-pointer"
                >
                  <input
                    ref={idx === 0 ? initialRadioRef : undefined}
                    type="radio"
                    name="issueReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="text-primary focus:ring-primary"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              {t("issueDetailsLabel")}
            </label>
            <textarea
              rows={2}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={t("issueDetailsPlaceholder")}
              className="w-full text-xs rounded-xl border border-border bg-surface text-foreground p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-destructive font-medium">{errorMsg}</p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs min-h-[44px] sm:min-h-[36px]"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-amber-600 hover:bg-amber-700 text-primary-foreground font-bold text-xs min-h-[44px] sm:min-h-[36px]"
            >
              {isSubmitting && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
              <span>{t("confirmIssue")}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
