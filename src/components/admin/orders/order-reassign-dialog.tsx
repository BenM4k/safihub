"use client";

import { useState } from "react";
import { ArrowRightLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import type { OrderListItemRecord } from "@/dal";
import { reassignOrderPressingAction } from "@/actions/admin-dispatch.actions";
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

interface OrderReassignDialogProps {
  order: OrderListItemRecord | null;
  houses: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSuccess: () => void;
}

export function OrderReassignDialog({
  order,
  houses,
  onClose,
  onSuccess,
}: OrderReassignDialogProps) {
  const t = useTranslations("admin.orders");
  const [selectedHouseId, setSelectedHouseId] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [prevOrderId, setPrevOrderId] = useState<string | undefined>(order?.id);
  if (order?.id !== prevOrderId) {
    setPrevOrderId(order?.id);
    setSelectedHouseId("");
    setReason("");
    setError(null);
  }

  function handleClose() {
    setSelectedHouseId("");
    setReason("");
    setError(null);
    onClose();
  }

  const eligibleHouses = houses.filter((h) => h.id !== order?.houseId);
  const reference = order ? formatOrderReference(order.code, order.id) : "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedHouseId) {
      setError(t("reassignHouseRequired"));
      return;
    }
    if (!order) return;

    setLoading(true);
    setError(null);

    try {
      const res = await reassignOrderPressingAction({
        orderId: order.id,
        newHouseId: selectedHouseId,
        reason: reason.trim() || undefined,
      });

      if (!res.ok) {
        setError(res.error || t("reassignFailed"));
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
            <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ArrowRightLeft className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-foreground">
                {t("reassignTitle")}
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

          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border">
            {t("currentHouse")} : <span className="font-semibold text-foreground">{order?.houseName || "—"}</span>
          </div>

          <Field>
            <FieldLabel className="text-xs font-semibold text-foreground">
              {t("newHouse")} <span className="text-destructive">*</span>
            </FieldLabel>
            <select
              id="targetHouse"
              value={selectedHouseId}
              onChange={(e) => setSelectedHouseId(e.target.value)}
              className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
              required
            >
              <option value="">{t("selectHousePlaceholder")}</option>
              {eligibleHouses.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </Field>

          <Field>
            <FieldLabel className="text-xs font-semibold text-foreground">
              {t("reassignReasonLabel")}
            </FieldLabel>
            <Textarea
              id="reassignReason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("reassignReasonPlaceholder")}
              rows={2}
              className="text-xs resize-none"
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
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || !selectedHouseId}
              className="text-xs font-semibold bg-primary hover:bg-primary-hover text-white gap-1.5"
            >
              <ArrowRightLeft className="size-3.5" />
              <span>{loading ? t("reassigning") : t("confirm")}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
