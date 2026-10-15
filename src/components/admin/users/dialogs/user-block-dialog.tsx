"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, Ban, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { blockUserAction } from "@/actions/admin-user.actions";
import type { UserRow } from "../types";

interface UserBlockDialogProps {
  user: UserRow | null;
  isOpen: boolean;
  currentUserId?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserBlockDialog({
  user,
  isOpen,
  currentUserId,
  onClose,
  onSuccess,
}: UserBlockDialogProps) {
  const t = useTranslations("admin.users");
  const [reason, setReason] = useState("");
  const [selfConfirmed, setSelfConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isSelf = Boolean(currentUserId && user && currentUserId === user.id);

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setSelfConfirmed(false);
      setError(null);
      const timer = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError(t("blockReasonLabel"));
      return;
    }
    if (isSelf && !selfConfirmed) {
      setError("Veuillez cocher la confirmation pour bloquer votre propre compte.");
      return;
    }

    setLoading(true);
    setError(null);

    const fd = new FormData();
    fd.append("userId", user.id);
    fd.append("reason", reason.trim());
    if (isSelf) {
      fd.append("confirmedSelfAction", "true");
    }

    const res = await blockUserAction(fd);
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
        aria-labelledby="block-dialog-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-border-strong bg-destructive-light/40">
          <div className="flex items-center gap-2 text-destructive font-bold text-sm">
            <Ban className="size-5" />
            <span id="block-dialog-title">{t("blockConfirm")}</span>
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

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <p className="text-xs text-ink-700 leading-relaxed">
              Êtes-vous sûr de vouloir bloquer le compte de{" "}
              <strong className="text-heading font-semibold">{user.name}</strong> ?
            </p>
            <p className="text-2xs text-ink-500">
              Toutes les sessions actives associées à ce compte seront immédiatement
              révoquées.
            </p>
          </div>

          {/* Self Action Warning */}
          {isSelf && (
            <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <AlertTriangle className="size-4 text-amber-600" />
                <span>Attention : action sur votre propre compte</span>
              </div>
              <p className="text-2xs text-amber-800 leading-relaxed">
                Vous êtes actuellement connecté avec ce compte. Si vous le bloquez, vous
                serez déconnecté sans possibilité de vous reconnecter sans l&apos;intervention
                d&apos;un autre administrateur.
              </p>
              <label className="flex items-center gap-2 pt-1 text-xs font-semibold text-amber-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selfConfirmed}
                  onChange={(e) => setSelfConfirmed(e.target.checked)}
                  className="rounded border-amber-400 text-amber-700 focus:ring-amber-500"
                />
                <span>Je confirme vouloir bloquer mon propre compte</span>
              </label>
            </div>
          )}

          {/* Mandatory Reason */}
          <div className="space-y-1.5">
            <Label htmlFor="block-reason" className="text-xs font-bold text-heading">
              {t("blockReasonLabel")} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="block-reason"
              ref={inputRef}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("blockReasonPlaceholder")}
              required
              className="min-h-[40px] text-xs bg-surface border-2 border-border-strong rounded-xl text-heading"
            />
          </div>

          {error && (
            <div className="p-2.5 bg-destructive-light border border-destructive-base/30 rounded-xl text-xs font-semibold text-destructive flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
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
              type="submit"
              disabled={loading || !reason.trim() || (isSelf && !selfConfirmed)}
              className="min-h-[40px] px-4 text-xs font-bold bg-destructive hover:bg-destructive/90 text-white rounded-xl shadow-xs"
            >
              {loading ? "Blocage en cours…" : t("blockUser")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
