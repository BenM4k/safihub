"use client";

import { useState } from "react";
import { AlertTriangle, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import type { OrderListItemRecord } from "@/dal";
import { performOnBehalfAction } from "@/actions/admin-order.actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { formatOrderReference } from "@/lib/order-formatters";

interface OrderCancelDialogProps {
  order: OrderListItemRecord | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function OrderCancelDialog({
  order,
  onClose,
  onSuccess,
}: OrderCancelDialogProps) {
  const t = useTranslations("admin.orders");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [prevOrderId, setPrevOrderId] = useState<string | undefined>(order?.id);
  if (order?.id !== prevOrderId) {
    setPrevOrderId(order?.id);
    setReason("");
    setError(null);
  }

  function handleClose() {
    setReason("");
    setError(null);
    onClose();
  }

  const reference = order ? formatOrderReference(order.code, order.id) : "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) {
      setError(t("cancelReasonRequired"));
      return;
    }
    if (!order) return;

    setLoading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("orderId", order.id);
      fd.append("targetStatus", "cancelled");
      fd.append("onBehalfOfHouseId", order.houseId);
      fd.append("reason", reason.trim());

      const res = await performOnBehalfAction(fd);
      if (!res.ok) {
        setError(res.error || t("cancelFailed"));
      } else {
        handleClose();
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("screeningError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={Boolean(order)} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden font-sans">
        <DialogHeader className="p-4 sm:p-5 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
              <AlertTriangle className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-destructive">
                {t("cancelTitle")}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("orderLabel")}{" "}
                <span className="font-mono font-semibold text-foreground">{reference}</span>
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          <p className="text-xs text-muted-foreground leading-relaxed">
            {t("cancelAuditNotice")}
          </p>

          <Field>
            <FieldLabel className="text-xs font-semibold text-foreground">
              {t("cancelReasonLabel")} <span className="text-destructive">*</span>
            </FieldLabel>
            <Textarea
              id="cancelReason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("cancelReasonPlaceholder")}
              rows={3}
              className="text-xs resize-none"
              required
            />
          </Field>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={loading}
              className="text-xs font-semibold"
            >
              {t("close")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || !reason.trim()}
              className="text-xs font-semibold bg-destructive hover:bg-destructive/90 text-white gap-1.5"
            >
              <XCircle className="size-3.5" />
              <span>{loading ? t("cancelling") : t("cancelConfirm")}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
