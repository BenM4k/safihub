"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, AlertTriangle, Ban } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
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

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setReason("");
      setSelfConfirmed(false);
      setError(null);
    }
  }

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError(t("blockReasonLabel"));
      return;
    }
    if (isSelf && !selfConfirmed) {
      setError(t("selfBlockConfirmRequired"));
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

    try {
      const res = await blockUserAction(fd);
      if (!res.ok) {
        setError(res.error);
      } else {
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("unknownError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-xl border border-border shadow-lg bg-card gap-0">
        <DialogHeader className="p-4 border-b border-border bg-destructive/10 flex flex-row items-center gap-2.5 space-y-0">
          <div className="size-8 rounded-lg flex items-center justify-center border border-destructive/20 bg-destructive/10 text-destructive shrink-0">
            <Ban className="size-4" />
          </div>
          <DialogTitle className="text-sm font-bold text-destructive">
            {t("blockConfirm")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1 text-xs text-muted-foreground leading-relaxed">
            <p>{t("blockConfirmQuestion", { name: user.name })}</p>
            <p className="text-2xs text-muted-foreground/80">
              {t("blockSessionsRevokedNotice")}
            </p>
          </div>

          {/* Self Action Warning */}
          {isSelf && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                <AlertTriangle className="size-4 shrink-0" />
                <span>{t("selfBlockAlertTitle")}</span>
              </div>
              <p className="text-2xs text-muted-foreground leading-relaxed">
                {t("selfBlockAlertDesc")}
              </p>
              <label className="flex items-center gap-2 pt-1 text-xs font-semibold text-foreground cursor-pointer">
                <Checkbox
                  checked={selfConfirmed}
                  onCheckedChange={(checked) => setSelfConfirmed(Boolean(checked))}
                />
                <span>{t("selfBlockCheck")}</span>
              </label>
            </div>
          )}

          {/* Mandatory Reason */}
          <Field className="gap-2">
            <FieldLabel htmlFor="block-reason" className="text-xs sm:text-sm font-semibold">
              {t("blockReasonLabel")} <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="block-reason"
              ref={inputRef}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("blockReasonPlaceholder")}
              required
              disabled={loading}
            />
          </Field>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={loading || !reason.trim() || (isSelf && !selfConfirmed)}
            >
              {loading && <Spinner className="size-3.5 mr-1.5" />}
              {loading ? t("blocking") : t("blockUser")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
