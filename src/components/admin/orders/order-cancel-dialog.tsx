"use client";

import { useState } from "react";
import { AlertTriangle, X, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import type { OrderListItemRecord } from "@/dal";
import { performOnBehalfAction } from "@/actions/admin-order.actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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

  if (!order) return null;

  const reference = formatOrderReference(order.code, order.id);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Un motif d'annulation est requis pour la traçabilité d'audit.");
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
        setError(res.error || "Échec de l'annulation de la commande");
      } else {
        handleClose();
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/40 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-md bg-card rounded-2xl border-2 border-destructive/30 shadow-lift overflow-hidden font-sans animate-in zoom-in-95 duration-150">
        <div className="p-4 sm:p-5 border-b border-destructive/20 flex items-center justify-between bg-destructive-light/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 id="cancel-dialog-title" className="text-sm font-bold text-destructive">
                {t("cancelTitle")}
              </h2>
              <p className="text-xs text-muted-foreground">
                Commande <span className="font-mono font-semibold text-heading">{reference}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-ink-400 hover:text-heading hover:bg-muted transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-destructive-light border border-destructive-base/20 text-xs text-destructive-base">
              {error}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Cette action annulera définitivement la commande et enregistrera un événement d&apos;audit au nom de l&apos;opérateur.
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="cancelReason" className="text-xs font-semibold text-heading">
              Motif de l&apos;annulation <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="cancelReason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("cancelReasonPlaceholder")}
              rows={3}
              className="text-xs bg-card border-border-strong shadow-xs resize-none"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-strong">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={loading}
              className="text-xs h-8 font-semibold border-border-strong shadow-xs hover:shadow-sm cursor-pointer"
            >
              Fermer
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || !reason.trim()}
              className="text-xs h-8 font-semibold bg-destructive hover:bg-destructive/90 text-white shadow-xs hover:shadow-sm gap-1.5 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>{loading ? "Annulation..." : t("cancelConfirm")}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
