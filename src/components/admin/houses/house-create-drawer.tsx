"use client";

import { useState, useTransition } from "react";
import { X, Building2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createHouseAction } from "@/actions/admin-house.actions";
import { isValidDrcPhone, normalizeDrcPhone } from "@/lib/phone-utils";
import { bpsToPercentString } from "@/lib/commission-conversion";
import type { NeighborhoodRecord } from "@/dal";
import type { AdminHouseRow } from "./types";

interface HouseCreateDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  neighborhoods: NeighborhoodRecord[];
  existingHouses: AdminHouseRow[];
  defaultCommissionBps: number;
  onSuccess: () => void;
}

export function HouseCreateDrawer({
  isOpen,
  onClose,
  neighborhoods,
  existingHouses,
  defaultCommissionBps,
  onSuccess,
}: HouseCreateDrawerProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [neighborhoodId, setNeighborhoodId] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [commissionPercent, setCommissionPercent] = useState("");
  const [minimumOrderAmount, setMinimumOrderAmount] = useState("5000");
  const [turnaroundHours, setTurnaroundHours] = useState("48");
  const [addressNote, setAddressNote] = useState("");
  const [dailyCapacity, setDailyCapacity] = useState("");

  if (!isOpen) return null;

  const defaultPercentStr = bpsToPercentString(defaultCommissionBps) ?? "20";

  // Real-time validations
  const isDuplicateName = existingHouses.some(
    (h) => h.name.trim().toLowerCase() === name.trim().toLowerCase()
  );
  const isNameValid = name.trim().length > 0 && !isDuplicateName;
  const isNeighborhoodValid = neighborhoodId !== "";
  const isPhoneValid = contactPhone.trim() === "" || isValidDrcPhone(contactPhone);
  const minOrderNum = Number(minimumOrderAmount);
  const isMinOrderValid =
    minimumOrderAmount !== "" &&
    Number.isInteger(minOrderNum) &&
    minOrderNum >= 0;
  const turnaroundNum = Number(turnaroundHours);
  const isTurnaroundValid =
    turnaroundHours !== "" &&
    Number.isInteger(turnaroundNum) &&
    turnaroundNum >= 1 &&
    turnaroundNum <= 720;

  const isFormValid =
    isNameValid &&
    isNeighborhoodValid &&
    isPhoneValid &&
    isMinOrderValid &&
    isTurnaroundValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isPending) return;

    setError(null);
    const formData = new FormData();
    formData.set("name", name.trim());
    formData.set("neighborhoodId", neighborhoodId);
    if (contactPhone.trim()) {
      formData.set("contactPhone", normalizeDrcPhone(contactPhone));
    }
    if (commissionPercent.trim()) {
      formData.set("commissionPercent", commissionPercent.trim());
    }
    formData.set("minimumOrderAmount", minimumOrderAmount);
    formData.set("turnaroundHours", turnaroundHours);
    if (addressNote.trim()) formData.set("addressNote", addressNote.trim());
    if (dailyCapacity.trim()) formData.set("dailyCapacity", dailyCapacity.trim());

    startTransition(async () => {
      const res = await createHouseAction(formData);
      if (!res.ok) {
        setError(res.error || "Erreur lors de la création du pressing");
      } else {
        onSuccess();
        onClose();
      }
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-drawer-title"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end"
    >
      <div className="w-full max-w-md bg-card h-full shadow-2xl border-l-2 border-border-strong flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b-2 border-border-strong bg-surface flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary-soft text-primary flex items-center justify-center border border-primary/20">
              <Building2 className="size-5" />
            </div>
            <div>
              <h2 id="create-drawer-title" className="text-sm font-bold text-heading">
                Ajouter un pressing
              </h2>
              <p className="text-[11px] text-ink-600">Nouveau pressing partenaire</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-500 hover:text-ink-800 hover:bg-surface-hover transition-colors"
            aria-label="Fermer le panneau"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {error && (
            <div role="alert" className="p-3 rounded-xl bg-destructive-light border border-destructive-base/30 text-destructive-base flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="create-name" className="text-xs font-semibold text-heading">
              Nom du pressing <span className="text-destructive-base">*</span>
            </Label>
            <Input
              id="create-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Pressing du Lac"
              className={`h-10 text-xs border-2 ${isDuplicateName ? "border-destructive-base" : "border-border-strong"}`}
            />
            {isDuplicateName && (
              <p className="text-[11px] text-destructive-base font-medium">Un pressing porte déjà ce nom.</p>
            )}
          </div>

          {/* Neighborhood */}
          <div className="space-y-1.5">
            <Label htmlFor="create-neigh" className="text-xs font-semibold text-heading">
              Quartier <span className="text-destructive-base">*</span>
            </Label>
            <select
              id="create-neigh"
              required
              value={neighborhoodId}
              onChange={(e) => setNeighborhoodId(e.target.value)}
              className="h-10 w-full rounded-xl border-2 border-border-strong bg-card px-3 text-xs font-semibold text-heading"
            >
              <option value="">-- Choisir un quartier --</option>
              {neighborhoods.map((n) => (
                <option key={n.id} value={n.id}>{n.name} ({n.zoneName})</option>
              ))}
            </select>
          </div>

          {/* Contact Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="create-phone" className="text-xs font-semibold text-heading">
              Téléphone de contact
            </Label>
            <Input
              id="create-phone"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+243 90 000 0001"
              className="h-10 text-xs border-2 border-border-strong"
            />
            <p className="text-[11px] text-ink-500">Format RDC : +243 XX XXX XXXX (ex: 090 000 0001)</p>
          </div>

          {/* Commission & Min order in 2 cols */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="create-comm" className="text-xs font-semibold text-heading">
                Commission (%)
              </Label>
              <div className="relative">
                <Input
                  id="create-comm"
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
              <Label htmlFor="create-min" className="text-xs font-semibold text-heading">
                Montant min. (CDF)
              </Label>
              <div className="relative">
                <Input
                  id="create-min"
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

          {/* Turnaround & Capacity */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="create-turn" className="text-xs font-semibold text-heading">
                Délai de traitement
              </Label>
              <div className="relative">
                <Input
                  id="create-turn"
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
              <Label htmlFor="create-cap" className="text-xs font-semibold text-heading">
                Capacité journalière
              </Label>
              <Input
                id="create-cap"
                type="number"
                min="1"
                placeholder="Illimitée"
                value={dailyCapacity}
                onChange={(e) => setDailyCapacity(e.target.value)}
                className="h-10 text-xs border-2 border-border-strong"
              />
            </div>
          </div>

          {/* Address Note */}
          <div className="space-y-1.5">
            <Label htmlFor="create-addr" className="text-xs font-semibold text-heading">
              Adresse précise / repère
            </Label>
            <Input
              id="create-addr"
              value={addressNote}
              onChange={(e) => setAddressNote(e.target.value)}
              placeholder="ex: En face de la cathédrale, porte rouge"
              className="h-10 text-xs border-2 border-border-strong"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t-2 border-border-strong flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="min-h-[40px] px-4 text-xs font-semibold border-2 border-border-strong"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isPending}
              className="min-h-[40px] px-4 text-xs font-semibold bg-primary hover:bg-primary-hover text-white shadow-2xs"
            >
              {isPending ? "Création en cours..." : "Ajouter un pressing"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
