"use client";

import { useState } from "react";
import { Undo2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { reverseCourierReconciliationAction } from "@/actions/admin-cash.actions";
import { useRouter } from "next/navigation";

interface HistoryRowActionsProps {
  reconciliationId: string;
  courierName: string;
  businessDate: string;
  isCancelled: boolean;
}

export function HistoryRowActions({
  reconciliationId,
  courierName,
  businessDate,
  isCancelled,
}: HistoryRowActionsProps) {
  const t = useTranslations("admin.cash");
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  if (isCancelled) {
    return (
      <span className="text-xs text-muted-foreground italic">
        {t("filterStatusCancelled")}
      </span>
    );
  }

  const handleConfirmReversal = async (reason?: string) => {
    if (!reason?.trim()) {
      return { ok: false, error: t("reversalReasonLabel") };
    }

    const res = await reverseCourierReconciliationAction({
      reconciliationId,
      reason: reason.trim(),
    });

    if (res.ok) {
      router.refresh();
      return { ok: true };
    }

    return { ok: false, error: res.error || t("filterStatusCancelled") };
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setIsConfirmOpen(true)}
        className="h-9 px-3 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 rounded-lg"
        title={t("reversalDialogTitle")}
      >
        <Undo2 className="size-3.5" />
        <span>{t("reversalBtn")}</span>
      </Button>

      {isConfirmOpen && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleConfirmReversal}
          title={t("reversalDialogTitle")}
          description={
            <div className="space-y-2 text-xs">
              <p>
                {t("reversalDescription", { name: courierName, date: businessDate })}
              </p>
              <p className="p-2.5 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 font-medium">
                {t("reversalConsequence")}
              </p>
            </div>
          }
          confirmLabel={t("confirmReversal")}
          variant="destructive"
          requireReason={true}
          reasonLabel={t("reversalReasonLabel")}
          reasonPlaceholder={t("reversalReasonPlaceholder")}
        />
      )}
    </>
  );
}
