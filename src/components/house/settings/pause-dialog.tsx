"use client";

import { useState } from "react";
import { AlertCircle, PauseCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl bg-card border border-border shadow-lift font-sans">
        <DialogHeader className="p-4 sm:p-5 pr-12 border-b border-border/60 bg-surface text-left shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <PauseCircle className="size-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-sm font-bold text-foreground">
                Mettre le pressing en pause
              </DialogTitle>
              <DialogDescription className="text-2xs text-slate-600 dark:text-slate-300">
                Suspension temporaire de la réception de nouvelles commandes
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleConfirm} className="overflow-y-auto overflow-x-hidden flex-1 max-w-full p-4 sm:p-5 space-y-4 text-xs min-w-0">
          <div className="rounded-xl border-l-2 border-primary/50 bg-muted/20 pl-3.5 p-3 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
            <AlertCircle className="size-4 text-primary shrink-0 mt-0.5" />
            <div className="leading-relaxed text-[11px] min-w-0 flex-1 break-words">
              <strong className="text-foreground block">Effet sur les commandes en cours :</strong>
              Les commandes déjà passées continuent d&apos;être traitées et livrées normalement. Seule la prise de <em>nouvelles commandes</em> est suspendue.
            </div>
          </div>

          <div>
            <label className="font-semibold text-foreground block mb-1">
              Motif de la mise en pause
            </label>
            <div className="space-y-1.5">
              {REASON_PRESETS.map((preset) => (
                <label
                  key={preset}
                  className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition text-xs ${
                    selectedPreset === preset
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="reasonPreset"
                    checked={selectedPreset === preset}
                    onChange={() => setSelectedPreset(preset)}
                    className="accent-primary"
                  />
                  <span>{preset}</span>
                </label>
              ))}
            </div>

            {selectedPreset === "Autre motif" && (
              <Input
                type="text"
                placeholder="Préciser le motif de pause..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="mt-2 text-base sm:text-xs rounded-lg w-full min-w-0"
                autoFocus
              />
            )}
          </div>

          <DurationPicker
            durationMode={durationMode}
            presetDurationHours={presetDurationHours}
            customDateTime={customDateTime}
            onSetDurationMode={setDurationMode}
            onSetPresetHours={setPresetDurationHours}
            onSetCustomDateTime={setCustomDateTime}
          />

          {dateError && (
            <div
              role="alert"
              className="rounded-xl border border-destructive/20 bg-destructive-soft/30 p-2.5 text-xs font-semibold text-destructive flex items-center gap-2"
            >
              <AlertCircle className="size-3.5 shrink-0" />
              <span>{dateError}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-3 border-t border-border/60 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="w-full sm:w-auto text-xs h-9 px-4 rounded-lg cursor-pointer"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              size="sm"
              className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-9 px-4 rounded-lg shadow-xs cursor-pointer"
            >
              Confirmer la pause
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
