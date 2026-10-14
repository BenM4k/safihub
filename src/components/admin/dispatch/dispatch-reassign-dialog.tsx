"use client";

import { useState } from "react";
import { ArrowRightLeft, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reassignOrderPressingAction } from "@/actions/admin-dispatch.actions";
import { formatOrderRef } from "@/lib/dispatch-urgency";
import type { AvailablePressingOption } from "@/services/admin";

interface DispatchReassignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderCode?: string;
  currentHouseId: string;
  currentHouseName?: string;
  availablePressings: AvailablePressingOption[];
  onSuccess?: () => void;
}

export function DispatchReassignDialog({
  isOpen,
  onClose,
  orderId,
  orderCode,
  currentHouseId,
  currentHouseName,
  availablePressings,
  onSuccess,
}: DispatchReassignDialogProps) {
  const [selectedHouseId, setSelectedHouseId] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    setSelectedHouseId("");
    setReason("");
    setError(null);
    onClose();
  }

  if (!isOpen) return null;

  const eligibleHouses = availablePressings.filter((h) => h.id !== currentHouseId);

  async function handleReassign() {
    if (!selectedHouseId) {
      setError("Veuillez sélectionner un nouveau pressing.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const res = await reassignOrderPressingAction({
      orderId,
      newHouseId: selectedHouseId,
      reason: reason.trim() || undefined,
    });

    setIsSubmitting(false);

    if (!res.ok) {
      setError(res.error);
    } else {
      handleClose();
      if (onSuccess) onSuccess();
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reassign-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/40 backdrop-blur-xs animate-in fade-in font-sans"
    >
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border bg-surface flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-warning-soft text-warning">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <h3 id="reassign-dialog-title" className="text-base font-bold text-heading font-display">
              Réassigner à un autre pressing
            </h3>
            <p className="text-xs text-muted-foreground">
              Commande {formatOrderRef(orderCode, orderId)} • Actuel: {currentHouseName || "N/A"}
            </p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-destructive-soft border border-destructive/20 text-destructive rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="new-house-select"
              className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5"
            >
              Nouveau pressing partenaire
            </label>
            <select
              id="new-house-select"
              value={selectedHouseId}
              onChange={(e) => setSelectedHouseId(e.target.value)}
              className="w-full text-xs p-3 rounded-lg border border-border-strong bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-heading"
            >
              <option value="">Sélectionner un pressing disponible ({eligibleHouses.length})</option>
              {eligibleHouses.map((house) => (
                <option key={house.id} value={house.id}>
                  {house.name} {house.neighborhoodName ? `(${house.neighborhoodName})` : ""}{" "}
                  {house.contactPhone ? `• ${house.contactPhone}` : ""}
                </option>
              ))}
            </select>
            {eligibleHouses.length === 0 && (
              <p className="text-[11px] text-warning mt-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                Aucun autre pressing partenaire actif n&apos;est disponible actuellement.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="reassign-reason"
              className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5"
            >
              Motif de la réassignation
            </label>
            <input
              id="reassign-reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Refus explicite, injoignable après 2 relances..."
              className="w-full text-xs p-3 rounded-lg border border-border-strong bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-heading placeholder:text-ink-400"
            />
          </div>

          <div className="p-3 rounded-lg bg-surface border border-border text-[11px] text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Conséquences de la réassignation :</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Un nouveau délai d&apos;acceptation de 45 minutes sera initialisé.</li>
              <li>L&apos;historique de la commande conservera la trace de l&apos;ancien pressing.</li>
            </ul>
          </div>
        </div>

        <div className="p-4 bg-surface border-t border-border flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-xs min-h-[40px] px-4 border-border-strong hover:bg-muted text-foreground font-display"
          >
            Annuler
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isSubmitting || !selectedHouseId}
            onClick={handleReassign}
            className="text-xs min-h-[40px] px-5 bg-primary text-primary-foreground hover:bg-primary-hover font-display"
          >
            {isSubmitting ? "Réassignation..." : "Confirmer la réassignation"}
          </Button>
        </div>
      </div>
    </div>
  );
}
