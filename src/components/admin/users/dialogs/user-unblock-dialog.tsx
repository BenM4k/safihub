"use client";

import { useTranslations } from "next-intl";
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { unblockUserAction } from "@/actions/admin-user.actions";
import type { UserRow } from "../types";

interface UserUnblockDialogProps {
  user: UserRow | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserUnblockDialog({
  user,
  isOpen,
  onClose,
  onSuccess,
}: UserUnblockDialogProps) {
  const t = useTranslations("admin.users");

  if (!user) return null;

  const handleConfirm = async () => {
    const fd = new FormData();
    fd.append("userId", user.id);
    const res = await unblockUserAction(fd);
    if (!res.ok) {
      return { ok: false, error: res.error };
    }
    onSuccess();
  };

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title={t("unblockConfirm")}
      variant="primary"
      confirmLabel={t("unblockUser")}
      cancelLabel={t("cancel")}
      description={
        <div className="flex flex-col gap-1 text-xs text-muted-foreground leading-relaxed">
          <p>{t("unblockConfirmQuestion", { name: user.name })}</p>
          <p className="text-2xs text-muted-foreground/80">{t("unblockNotice")}</p>
        </div>
      }
    />
  );
}

