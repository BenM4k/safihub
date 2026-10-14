"use client";

import { useState } from "react";
import { ArrowRightLeft, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { OrderListItemRecord } from "@/dal";
import { reassignOrderPressingAction } from "@/actions/admin-dispatch.actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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

  if (!order) return null;

  const eligibleHouses = houses.filter((h) => h.id !== order.houseId);
  const reference = formatOrderReference(order.code, order.id);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedHouseId) {
      setError("Veuillez sélectionner un nouveau pressing.");
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
        setError(res.error || "Échec de la réassignation");
      } else {
        onSuccess();
        onClose();
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
      aria-labelledby="reassign-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/40 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-md bg-card rounded-2xl border border-border-strong shadow-lift overflow-hidden font-sans animate-in zoom-in-95 duration-150">
        <div className="p-4 sm:p-5 border-b border-border-strong flex items-center justify-between bg-surface">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-soft text-primary flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h2 id="reassign-dialog-title" className="text-sm font-bold text-heading">
                {t("reassignTitle")}
              </h2>
              <p className="text-xs text-muted-foreground">
                Commande <span className="font-mono font-semibold text-heading">{reference}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
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

          <div className="text-xs text-muted-foreground bg-surface p-3 rounded-lg border border-border-strong shadow-2xs">
            Pressing actuel : <span className="font-semibold text-heading">{order.houseName || "—"}</span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="targetHouse" className="text-xs font-semibold text-heading">
              Nouveau pressing partenaire
            </Label>
            <select
              id="targetHouse"
              value={selectedHouseId}
              onChange={(e) => setSelectedHouseId(e.target.value)}
              className="w-full h-9 rounded-lg border border-border-strong bg-card shadow-xs px-3 text-xs text-heading font-medium hover:border-ink-400 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              required
            >
              <option value="">Sélectionner un pressing...</option>
              {eligibleHouses.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reassignReason" className="text-xs font-semibold text-heading">
              Motif de réassignation (optionnel)
            </Label>
            <Textarea
              id="reassignReason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex : Capacité insuffisante, délai non respecté..."
              rows={2}
              className="text-xs bg-card border-border-strong shadow-xs resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-strong">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
              className="text-xs h-8 font-semibold border-border-strong shadow-xs hover:shadow-sm cursor-pointer"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || !selectedHouseId}
              className="text-xs h-8 font-semibold bg-primary hover:bg-primary-hover text-white shadow-xs hover:shadow-sm gap-1.5 cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>{loading ? "Réassignation..." : "Confirmer"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
