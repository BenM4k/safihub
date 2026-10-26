"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<{ ok: boolean; error?: string } | void>;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "primary";
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = "destructive",
  requireReason = false,
  reasonLabel,
  reasonPlaceholder,
}: ConfirmDialogProps) {
  const t = useTranslations("admin.shared");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const reasonInputRef = useRef<HTMLInputElement>(null);

  const isDestructive = variant === "destructive";
  const finalConfirmLabel = confirmLabel ?? t("confirm");
  const finalCancelLabel = cancelLabel ?? t("cancel");
  const finalReasonLabel = reasonLabel ?? t("reasonRequired");
  const finalReasonPlaceholder = reasonPlaceholder ?? t("reasonPlaceholder");

  const handleClose = () => {
    if (loading) return;
    setReason("");
    setErrorMessage(null);
    onClose();
  };

  useEffect(() => {
    if (!isOpen || !requireReason) return;

    const timer = setTimeout(() => {
      reasonInputRef.current?.focus();
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen, requireReason]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requireReason && !reason.trim()) {
      setErrorMessage(t("reasonRequiredError"));
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await onConfirm(reason.trim());
      if (res && !res.ok) {
        setErrorMessage(res.error || t("operationError"));
        setLoading(false);
        return;
      }
      handleClose();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : t("unexpectedError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent
        className="w-full max-w-md p-0 overflow-hidden rounded-2xl border border-border shadow-xl bg-card gap-0"
        showCloseButton={!loading}
      >
        <DialogHeader className="p-4 border-b border-border bg-surface flex flex-row items-center gap-2.5 space-y-0">
          <div
            className={cn(
              "size-8 rounded-lg flex items-center justify-center border shrink-0",
              isDestructive
                ? "bg-destructive-light text-destructive-base border-destructive-base/30"
                : "bg-primary-soft text-primary border-primary/20"
            )}
          >
            <AlertTriangle className="size-4" aria-hidden="true" />
          </div>
          <DialogTitle className="text-sm font-bold text-heading font-display">
            {title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="p-5 flex flex-col gap-4">
          <div className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </div>

          {errorMessage && (
            <Alert variant="destructive" className="py-2.5 px-3">
              <AlertDescription className="text-xs font-medium">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          {requireReason && (
            <Field className="gap-1.5">
              <FieldLabel className="text-xs font-semibold text-heading">
                {finalReasonLabel} <span className="text-destructive-base">*</span>
              </FieldLabel>
              <Input
                ref={reasonInputRef}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={finalReasonPlaceholder}
                className="text-xs h-10 min-h-[40px]"
                disabled={loading}
              />
            </Field>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={loading}
              className="min-h-[40px] px-4 text-xs font-semibold"
            >
              {finalCancelLabel}
            </Button>
            <Button
              type="submit"
              variant={isDestructive ? "destructive" : "default"}
              size="sm"
              disabled={loading || (requireReason && !reason.trim())}
              className="min-h-[40px] px-4 text-xs font-semibold"
            >
              {loading && <Spinner className="size-3.5 text-current mr-1.5" />}
              {loading ? t("processing") : finalConfirmLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
