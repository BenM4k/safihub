"use client";

import { useState } from "react";
import { AlertCircle, PauseCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccessibleDialog } from "@/components/house/orders/use-accessible-dialog";
import { fromBukavuDateTime } from "@/services/availability/bukavu-time";
import {
  REASON_PRESETS,
  DurationPicker,
} from "./commandes/pause-dialog-parts";

interface PauseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { reason: string; pausedUntil: string | null }) => void;
}

export function PauseDialog({ isOpen, onClose, onConfirm }: PauseDialogProps) {
  const [selectedPreset, setSelectedPreset] = useState(REASON_PRESETS[0]);
  const [customReason, setCustomReason] = useState("");
  const [durationMode, setDurationMode] = useState<"preset" | "custom">("preset");
  const [presetDurationHours, setPresetDurationHours] = useState<number>(4);
  const [customDateTime, setCustomDateTime] = useState<string>("");
  const [dateError, setDateError] = useState<string | null>(null);

  const containerRef = useAccessibleDialog<HTMLDivElement>({ isOpen, onClose });

  if (!isOpen) return null;

  function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setDateError(null);
    const finalReason =
      selectedPreset === "Autre motif"
        ? customReason.trim() || "Mise en pause manuelle"
        : selectedPreset;

    let computedUntil: string | null = null;
    if (durationMode === "preset") {
      computedUntil = new Date(Date.now() + presetDurationHours * 3600 * 1000).toISOString();
    } else if (durationMode === "custom") {
      if (!customDateTime || !customDateTime.includes("T")) {
        setDateError("Veuillez sélectionner une date et heure.");
        return;
      }
      const [datePart, timePart] = customDateTime.split("T");
      if (!datePart || !timePart) {
        setDateError("Format de date invalide.");
        return;
      }
      const parsed = fromBukavuDateTime(datePart, timePart.slice(0, 5));
      if (isNaN(parsed.getTime()) || parsed.getTime() <= Date.now()) {
        setDateError("La date de reprise doit être située dans le futur (heure de Bukavu).");
        return;
      }
      computedUntil = parsed.toISOString();
    }

    onConfirm({ reason: finalReason, pausedUntil: computedUntil });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-dialog-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        ref={containerRef}
        className="w-full max-w-lg bg-card rounded-2xl shadow-2xl border border-border overflow-hidden"
      >
        <div className="p-4 border-b border-border flex items-center justify-between bg-surface">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-warning-soft text-warning border border-warning/30 flex items-center justify-center">
              <PauseCircle className="size-4" aria-hidden="true" />
            </div>
            <h2 id="pause-dialog-title" className="text-sm font-bold text-heading">
              Mettre le pressing en pause
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition"
            aria-label="Fermer"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-secondary/70 border border-border rounded-xl flex items-start gap-2.5">
            <AlertCircle className="size-4 text-primary shrink-0 mt-0.5" />
            <div className="text-muted-foreground leading-relaxed text-[11px]">
              <strong className="text-foreground block">Effet sur les commandes en cours :</strong>
              Les commandes déjà passées continuent d&apos;être traitées et livrées normalement. Seule la prise de <em>nouvelles commandes</em> est suspendue.
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-foreground block">
              Motif de la pause <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {REASON_PRESETS.map((preset) => (
                <label
                  key={preset}
                  className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition text-xs ${
                    selectedPreset === preset
                      ? "bg-primary/5 border-primary text-foreground font-medium"
                      : "bg-surface border-border hover:bg-secondary text-muted-foreground"
                  }`}
                >
                  <input
                    type="radio"
                    name="pauseReason"
                    value={preset}
                    checked={selectedPreset === preset}
                    onChange={() => setSelectedPreset(preset)}
                    className="accent-primary"
                  />
                  <span>{preset}</span>
                </label>
              ))}
            </div>

            {selectedPreset === "Autre motif" && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Précisez la raison de la mise en pause..."
                rows={2}
                className="w-full p-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary mt-1"
                required
              />
            )}
          </div>

          <DurationPicker
            durationMode={durationMode}
            presetDurationHours={presetDurationHours}
            customDateTime={customDateTime}
            onSetDurationMode={(m) => {
              setDateError(null);
              setDurationMode(m);
            }}
            onSetPresetHours={setPresetDurationHours}
            onSetCustomDateTime={(val) => {
              setDateError(null);
              setCustomDateTime(val);
            }}
          />

          {dateError && (
            <p className="text-destructive text-[11px] font-medium" role="alert">
              {dateError}
            </p>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs font-semibold">
              Annuler
            </Button>
            <Button type="submit" size="sm" className="bg-warning text-primary-foreground hover:bg-warning/90 font-bold text-xs">
              Mettre en pause
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
