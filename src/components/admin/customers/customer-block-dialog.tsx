"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, Ban, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  if (!isOpen || !customer) return null;

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
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border-2 border-border-strong overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b-2 border-border-strong flex items-center justify-between bg-surface">
          <div className="flex items-center gap-2.5">
            <div
              className={`size-8 rounded-lg flex items-center justify-center border ${
                isBlocked
                  ? "bg-success-light text-success-base border-success-base/30"
                  : "bg-destructive-light text-destructive border-destructive-base/30"
              }`}
            >
              <Ban className="size-4" />
            </div>
            <h2 className="text-sm font-bold text-heading font-display">
              {isBlocked ? t("titleUnblock") : t("titleBlock")}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-ink-400 hover:text-heading rounded-lg hover:bg-surface-hover"
            aria-label={t("close")}
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="text-xs text-ink-700 leading-relaxed">
            {isBlocked ? (
              <p>
                {t("confirmUnblockText", { name: displayName })}
              </p>
            ) : (
              <p>
                {t("confirmBlockText", { name: displayName })}
              </p>
            )}
          </div>

          {!isBlocked && customer.hasActiveOrders && (
            <div className="p-3 rounded-lg bg-amber-50 border-2 border-amber-300 text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle className="size-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <span className="font-bold block">{t("activeOrdersWarning")}</span>
                <span className="text-2xs text-amber-700">
                  {t("activeOrdersDesc")}
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-destructive-light border border-destructive-base/30 rounded-lg text-xs text-destructive font-medium">
              {error}
            </div>
          )}

          {!isBlocked && (
            <div className="space-y-1.5">
              <Label htmlFor="blockReasonInput" className="text-xs font-semibold text-heading">
                {t("reasonLabel")} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="blockReasonInput"
                ref={inputRef}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t("reasonPlaceholder")}
                className="h-10 text-xs border-2 border-border-strong rounded-lg"
                disabled={loading}
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t-2 border-border-strong">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
              className="min-h-[40px] px-4 text-xs font-semibold border-2 border-border-strong"
            >
              {t("cancelBtn")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || (!isBlocked && !reason.trim())}
              className={`min-h-[40px] px-4 text-xs font-bold text-white ${
                isBlocked
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-destructive hover:bg-destructive/90"
              }`}
            >
              {loading ? t("processingBtn") : isBlocked ? t("confirmUnblockBtn") : t("confirmBlockBtn")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
