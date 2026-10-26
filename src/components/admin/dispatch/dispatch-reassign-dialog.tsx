"use client";

import { useState } from "react";
import { ArrowRightLeft, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400">
              <ArrowRightLeft className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground font-display">
                Réassigner à un autre pressing
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Commande {formatOrderRef(orderCode, orderId)} · Actuel: {currentHouseName || "N/A"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-3 space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          <Field>
            <FieldLabel
              htmlFor="new-house-select"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
            >
              Nouveau pressing partenaire
            </FieldLabel>
            <select
              id="new-house-select"
              value={selectedHouseId}
              onChange={(e) => setSelectedHouseId(e.target.value)}
              className="mt-1.5 w-full text-xs h-9 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
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
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                <Building2 className="size-3.5" />
                <span>Aucun autre pressing partenaire actif n&apos;est disponible actuellement.</span>
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel
              htmlFor="reassign-reason"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
            >
              Motif de la réassignation
            </FieldLabel>
            <Input
              id="reassign-reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Refus explicite, injoignable après 2 relances..."
              className="mt-1.5 text-xs h-9"
            />
          </Field>

          <div className="p-3 rounded-lg bg-muted/40 border border-border text-[11px] text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Conséquences de la réassignation :</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Un nouveau délai d&apos;acceptation de 45 minutes sera initialisé.</li>
              <li>L&apos;historique de la commande conservera la trace de l&apos;ancien pressing.</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-muted/20 border-t border-border flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-xs h-8"
          >
            Annuler
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isSubmitting || !selectedHouseId}
            onClick={handleReassign}
            className="text-xs h-8"
          >
            {isSubmitting ? "Réassignation..." : "Confirmer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
