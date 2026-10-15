"use client";

import { useState, useTransition } from "react";
import { Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { updateHouseProfileAction } from "@/actions/admin-house.actions";
import { bpsToPercentString } from "@/lib/commission-conversion";
import type { AdminHouseRow } from "../types";

interface HouseTabSettingsProps {
  house: AdminHouseRow;
  defaultCommissionBps: number;
  onSuccess: () => void;
}

export function HouseTabSettings({
  house,
  defaultCommissionBps,
  onSuccess,
}: HouseTabSettingsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const initialCommStr = bpsToPercentString(house.commissionBps) ?? "";
  const defaultPercentStr = bpsToPercentString(defaultCommissionBps) ?? "20";

  const [name, setName] = useState(house.name);
  const [commissionPercent, setCommissionPercent] = useState(initialCommStr);
  const [minimumOrderAmount, setMinimumOrderAmount] = useState(String(house.minimumOrderAmount));
  const [turnaroundHours, setTurnaroundHours] = useState(String(house.turnaroundHours));
  const [cutoffMinutes, setCutoffMinutes] = useState(String(house.cutoffMinutes));
  const [dailyCapacity, setDailyCapacity] = useState(house.dailyCapacity ? String(house.dailyCapacity) : "");
  const [addressNote, setAddressNote] = useState(house.addressNote ?? "");

  const [confirmPriceModalOpen, setConfirmPriceModalOpen] = useState(false);

  const isCommissionChanged = commissionPercent.trim() !== initialCommStr.trim();
  const isMinOrderChanged = Number(minimumOrderAmount) !== house.minimumOrderAmount;

  const executeSave = () => {
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.set("name", name.trim());
    formData.set("neighborhoodId", house.neighborhoodId);
    if (house.contactPhone) formData.set("contactPhone", house.contactPhone);
    formData.set("commissionPercent", commissionPercent.trim());
    formData.set("minimumOrderAmount", minimumOrderAmount);
    formData.set("turnaroundHours", turnaroundHours);
    formData.set("cutoffMinutes", cutoffMinutes);
    if (dailyCapacity.trim()) formData.set("dailyCapacity", dailyCapacity.trim());
    if (addressNote.trim()) formData.set("addressNote", addressNote.trim());
    formData.set("isActive", house.isActive ? "true" : "false");
    formData.set("isPaused", house.isPaused ? "true" : "false");

    startTransition(async () => {
      const res = await updateHouseProfileAction(house.id, formData);
      if (!res.ok) {
        setError(res.error || "Erreur lors de la mise à jour");
      } else {
        setSuccess("Paramètres enregistrés avec succès.");
        onSuccess();
      }
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCommissionChanged || isMinOrderChanged) {
      setConfirmPriceModalOpen(true);
    } else {
      executeSave();
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {error && (
        <div role="alert" className="p-3 rounded-xl bg-destructive-light border border-destructive-base/30 text-destructive-base flex items-start gap-2">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div role="status" className="p-3 rounded-xl bg-success-light border border-success-base/30 text-success-base flex items-center gap-2 font-bold">
          <Check className="size-4" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="tab-name" className="text-xs font-semibold text-heading">
            Nom du pressing
          </Label>
          <Input
            id="tab-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10 text-xs border-2 border-border-strong"
          />
        </div>

        {/* Commission & Min order in 2 cols */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="tab-comm" className="text-xs font-semibold text-heading">
              Commission (%)
            </Label>
            <div className="relative">
              <Input
                id="tab-comm"
                value={commissionPercent}
                onChange={(e) => setCommissionPercent(e.target.value)}
                placeholder={defaultPercentStr}
                className="h-10 text-xs border-2 border-border-strong pr-7"
              />
              <span className="absolute right-2.5 top-2.5 text-xs font-bold text-ink-500 pointer-events-none">%</span>
            </div>
            <p className="text-[10px] text-ink-500">Vide = défaut ({defaultPercentStr} %)</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tab-min" className="text-xs font-semibold text-heading">
              Montant min. (CDF)
            </Label>
            <div className="relative">
              <Input
                id="tab-min"
                type="number"
                min="0"
                step="500"
                value={minimumOrderAmount}
                onChange={(e) => setMinimumOrderAmount(e.target.value)}
                className="h-10 text-xs border-2 border-border-strong pr-10"
              />
              <span className="absolute right-2.5 top-2.5 text-[11px] font-bold text-ink-500 pointer-events-none">CDF</span>
            </div>
          </div>
        </div>

        {/* Turnaround & Cutoff */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="tab-turn" className="text-xs font-semibold text-heading">
              Délai de traitement
            </Label>
            <div className="relative">
              <Input
                id="tab-turn"
                type="number"
                min="1"
                max="720"
                value={turnaroundHours}
                onChange={(e) => setTurnaroundHours(e.target.value)}
                className="h-10 text-xs border-2 border-border-strong pr-7"
              />
              <span className="absolute right-2.5 top-2.5 text-xs font-bold text-ink-500 pointer-events-none">h</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tab-cut" className="text-xs font-semibold text-heading">
              Délai avant fermeture
            </Label>
            <div className="relative">
              <Input
                id="tab-cut"
                type="number"
                min="0"
                value={cutoffMinutes}
                onChange={(e) => setCutoffMinutes(e.target.value)}
                className="h-10 text-xs border-2 border-border-strong pr-10"
              />
              <span className="absolute right-2.5 top-2.5 text-[11px] font-bold text-ink-500 pointer-events-none">min</span>
            </div>
          </div>
        </div>

        {/* Daily Capacity & Address */}
        <div className="space-y-1.5">
          <Label htmlFor="tab-cap" className="text-xs font-semibold text-heading">
            Capacité journalière (commandes / jour)
          </Label>
          <Input
            id="tab-cap"
            type="number"
            min="1"
            placeholder="Illimitée"
            value={dailyCapacity}
            onChange={(e) => setDailyCapacity(e.target.value)}
            className="h-10 text-xs border-2 border-border-strong"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tab-addr" className="text-xs font-semibold text-heading">
            Adresse précise / repère coursiers
          </Label>
          <Input
            id="tab-addr"
            value={addressNote}
            onChange={(e) => setAddressNote(e.target.value)}
            className="h-10 text-xs border-2 border-border-strong"
          />
        </div>

        {/* Submit */}
        <div className="pt-3 border-t-2 border-border-strong flex justify-end">
          <Button
            type="submit"
            disabled={isPending}
            className="min-h-[40px] px-5 text-xs font-semibold bg-primary hover:bg-primary-hover text-white shadow-2xs"
          >
            {isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>

      {/* Confirmation modal for pricing/commission changes */}
      <ConfirmDialog
        isOpen={confirmPriceModalOpen}
        onClose={() => setConfirmPriceModalOpen(false)}
        onConfirm={async () => {
          setConfirmPriceModalOpen(false);
          executeSave();
        }}
        title="Confirmation de modification tarifaire"
        variant="primary"
        confirmLabel="Appliquer la modification"
        cancelLabel="Annuler"
        description={
          <div className="space-y-3">
            <p className="font-semibold text-heading">
              Vous êtes sur le point de modifier les conditions commerciales de {house.name} :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              {isCommissionChanged && (
                <li>
                  Commission : <span className="font-bold">{initialCommStr || `Défaut (${defaultPercentStr})`} %</span> →{" "}
                  <span className="font-bold text-primary">{commissionPercent || `Défaut (${defaultPercentStr})`} %</span>
                </li>
              )}
              {isMinOrderChanged && (
                <li>
                  Montant minimum : <span className="font-bold">{house.minimumOrderAmount.toLocaleString()} CDF</span> →{" "}
                  <span className="font-bold text-primary">{Number(minimumOrderAmount).toLocaleString()} CDF</span>
                </li>
              )}
            </ul>
            <div className="p-3 bg-surface rounded-xl border border-border space-y-1">
              <p className="font-bold text-heading">Date d&apos;effet : Immédiate</p>
              <p className="text-[11px] text-ink-600">
                Cette modification s&apos;appliquera exclusivement aux nouvelles commandes. Les commandes existantes ou en cours conservent les tarifs et commissions enregistrés lors de leur création.
              </p>
            </div>
          </div>
        }
      />
    </div>
  );
}
