"use client";

import { useState, useTransition } from "react";
import { Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { updateHouseProfileAction } from "@/actions/admin-house.actions";
import { bpsToPercentString } from "@/lib/commission-conversion";
import { HouseTabSettingsFields } from "./house-tab-settings-fields";
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
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10">
          <Check className="size-4" />
          <AlertDescription className="font-semibold">{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-4">
        <HouseTabSettingsFields
          name={name}
          setName={setName}
          commissionPercent={commissionPercent}
          setCommissionPercent={setCommissionPercent}
          defaultPercentStr={defaultPercentStr}
          minimumOrderAmount={minimumOrderAmount}
          setMinimumOrderAmount={setMinimumOrderAmount}
          turnaroundHours={turnaroundHours}
          setTurnaroundHours={setTurnaroundHours}
          cutoffMinutes={cutoffMinutes}
          setCutoffMinutes={setCutoffMinutes}
          dailyCapacity={dailyCapacity}
          setDailyCapacity={setDailyCapacity}
          addressNote={addressNote}
          setAddressNote={setAddressNote}
        />

        <div className="pt-3 border-t border-border flex justify-end">
          <Button
            type="submit"
            disabled={isPending}
            size="sm"
            className="h-9 px-5 text-xs font-semibold"
          >
            {isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>

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
            <p className="font-semibold text-foreground">
              Vous êtes sur le point de modifier les conditions commerciales de {house.name} :
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              {isCommissionChanged && (
                <li>
                  Commission : <span className="font-bold text-foreground">{initialCommStr || `Défaut (${defaultPercentStr})`} %</span> →{" "}
                  <span className="font-bold text-primary">{commissionPercent || `Défaut (${defaultPercentStr})`} %</span>
                </li>
              )}
              {isMinOrderChanged && (
                <li>
                  Montant minimum : <span className="font-bold text-foreground">{house.minimumOrderAmount.toLocaleString()} CDF</span> →{" "}
                  <span className="font-bold text-primary">{Number(minimumOrderAmount).toLocaleString()} CDF</span>
                </li>
              )}
            </ul>
            <div className="p-3 bg-muted/40 rounded-lg border border-border space-y-1">
              <p className="font-bold text-foreground">Date d&apos;effet : Immédiate</p>
              <p className="text-[11px] text-muted-foreground">
                Cette modification s&apos;appliquera exclusivement aux nouvelles commandes. Les commandes existantes ou en cours conservent les tarifs et commissions enregistrés lors de leur création.
              </p>
            </div>
          </div>
        }
      />
    </div>
  );
}
