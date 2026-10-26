"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { toggleHouseActiveStatusAction } from "@/actions/admin-house.actions";
import type { AdminHouseRow } from "./types";

interface HouseSuspendDialogProps {
  house: AdminHouseRow | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function HouseSuspendDialog({
  house,
  isOpen,
  onClose,
  onSuccess,
}: HouseSuspendDialogProps) {
  const t = useTranslations("admin.houses");

  if (!house) return null;

  const isSuspending = house.isActive;

  const handleConfirm = async (reason?: string) => {
    const res = await toggleHouseActiveStatusAction({
      houseId: house.id,
      isActive: !house.isActive,
      reason,
    });

    if (res.ok) {
      onSuccess();
    }
    return res;
  };

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title={
        isSuspending
          ? t("suspendHouseTitle", { name: house.name })
          : t("reactivateHouseTitle", { name: house.name })
      }
      variant={isSuspending ? "destructive" : "primary"}
      confirmLabel={
        isSuspending ? t("confirmSuspendBtn") : t("confirmReactivateBtn")
      }
      cancelLabel={t("cancel")}
      requireReason={isSuspending}
      reasonLabel={
        isSuspending ? t("suspendReasonLabel") : t("reactivateReasonLabel")
      }
      reasonPlaceholder={
        isSuspending
          ? t("suspendReasonPlaceholder")
          : t("reactivateReasonPlaceholder")
      }
      description={
        <div className="space-y-3">
          {isSuspending ? (
            <>
              <p>
                {t("suspendDesc", { name: house.name })}
              </p>

              {house.activeOrdersCount > 0 && (
                <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-amber-700 dark:text-amber-400 flex items-start gap-2.5">
                  <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold">
                      {t("suspendActiveOrdersWarning", { count: house.activeOrdersCount })}
                    </p>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                      {t("suspendActiveOrdersDesc")}
                    </p>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-muted-foreground">
                {t("suspendAuditDesc")}
              </p>
            </>
          ) : (
            <p>
              {t("reactivateDesc", { name: house.name })}
            </p>
          )}
        </div>
      }
    />
  );
}
