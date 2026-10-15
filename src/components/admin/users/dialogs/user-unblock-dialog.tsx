"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleUnblock = async () => {
    setLoading(true);
    setError(null);

    const fd = new FormData();
    fd.append("userId", user.id);

    const res = await unblockUserAction(fd);
    setLoading(false);

    if (!res.ok) {
      setError(res.error);
    } else {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-card rounded-2xl border-2 border-border-strong shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="unblock-dialog-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-border-strong bg-emerald-50/60">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <CheckCircle2 className="size-5 text-emerald-600" />
            <span id="unblock-dialog-title">{t("unblockConfirm")}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-400 hover:text-ink-800 p-1 rounded-lg focus:outline-none"
            aria-label={t("cancel")}
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1 text-xs text-ink-700 leading-relaxed">
            <p>
              Souhaitez-vous débloquer le compte de{" "}
              <strong className="text-heading font-semibold">{user.name}</strong> ?
            </p>
            <p className="text-2xs text-ink-500">
              L&apos;utilisateur pourra à nouveau se connecter et exécuter ses opérations.
            </p>
          </div>

          {error && (
            <div className="p-2.5 bg-destructive-light border border-destructive-base/30 rounded-xl text-xs font-semibold text-destructive flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-strong/60">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="min-h-[40px] px-4 text-xs font-semibold border-2 border-border-strong bg-surface hover:bg-muted text-ink-800 rounded-xl"
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleUnblock}
              disabled={loading}
              className="min-h-[40px] px-4 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs"
            >
              {loading ? "Déblocage en cours…" : t("unblockUser")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
