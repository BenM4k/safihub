"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeliveryFailureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  isSubmitting?: boolean;
}

export function DeliveryFailureDialog({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: DeliveryFailureDialogProps) {
  const t = useTranslations("courier.delivery");
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length > 0) {
      onSubmit(reason.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
          <div className="flex items-center gap-2 text-rose-700 font-semibold text-sm">
            <AlertCircle className="size-4.5" />
            <span>{t("failModalTitle")}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("failReasonPlaceholder")}
            required
            rows={3}
            className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs h-8"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || reason.trim().length === 0}
              className="text-xs h-8 bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              {t("confirmFail")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
