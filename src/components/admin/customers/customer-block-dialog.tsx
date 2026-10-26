"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, AlertTriangle, Ban, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { blockCustomerAction, unblockCustomerAction } from "@/actions/admin-customer.actions";
import { formatCustomerName } from "@/lib/customer-formatters";
import type { CustomerRow } from "./types";

interface CustomerBlockDialogProps {
  customer: CustomerRow | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CustomerBlockDialog({
  customer,
  isOpen,
  onClose,
  onSuccess,
}: CustomerBlockDialogProps) {
  const t = useTranslations("admin.customers.blockDialog");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isBlocked = customer?.banned || customer?.status === "blocked";

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!customer) return null;

  const displayName = formatCustomerName(customer.name, customer.contactPhone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBlocked && !reason.trim()) {
      setError(t("reasonRequiredError"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("userId", customer.id);
      if (!isBlocked) {
        fd.append("reason", reason.trim());
      }

      const res = isBlocked ? await unblockCustomerAction(fd) : await blockCustomerAction(fd);

      if (!res.ok) {
        setError(res.error);
      } else {
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("genericError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-xl border border-border shadow-lg bg-card gap-0">
        <DialogHeader
          className={`p-4 border-b border-border flex flex-row items-center gap-2.5 space-y-0 ${
            isBlocked ? "bg-emerald-500/10" : "bg-destructive/10"
          }`}
        >
          <div
            className={`size-8 rounded-lg flex items-center justify-center border shrink-0 ${
              isBlocked
                ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
                : "bg-destructive/15 text-destructive border-destructive/30"
            }`}
          >
            {isBlocked ? <CheckCircle2 className="size-4" /> : <Ban className="size-4" />}
          </div>
          <DialogTitle
            className={`text-sm font-bold ${
              isBlocked ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"
            }`}
          >
            {isBlocked ? t("titleUnblock") : t("titleBlock")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div className="text-xs text-muted-foreground leading-relaxed">
            {isBlocked ? (
              <p>{t("confirmUnblockText", { name: displayName })}</p>
            ) : (
              <p>{t("confirmBlockText", { name: displayName })}</p>
            )}
          </div>

          {!isBlocked && customer.hasActiveOrders && (
            <Alert className="border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:border-amber-700">
              <AlertTriangle className="size-4 text-amber-600 shrink-0" />
              <AlertDescription className="text-xs">
                <span className="font-bold block">{t("activeOrdersWarning")}</span>
                <span className="text-2xs text-amber-800 dark:text-amber-300">
                  {t("activeOrdersDesc")}
                </span>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription className="text-xs font-medium">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {!isBlocked && (
            <Field className="gap-2">
              <FieldLabel htmlFor="blockReasonInput" className="text-xs sm:text-sm font-semibold">
                {t("reasonLabel")} <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="blockReasonInput"
                ref={inputRef}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t("reasonPlaceholder")}
                disabled={loading}
              />
            </Field>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              {t("cancelBtn")}
            </Button>
            <Button
              type="submit"
              variant={isBlocked ? "default" : "destructive"}
              disabled={loading || (!isBlocked && !reason.trim())}
              className={isBlocked ? "bg-emerald-600 hover:bg-emerald-700 text-white" : undefined}
            >
              {loading ? t("processingBtn") : isBlocked ? t("confirmUnblockBtn") : t("confirmBlockBtn")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
