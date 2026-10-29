"use client";

import { Clock } from "lucide-react";

export const REASON_PRESETS = [
  "Forte affluence / surcharge d'activité",
  "Panne machine ou coupure d'électricité",
  "Approvisionnement en eau interrompu",
  "Fermeture exceptionnelle / inventaire",
  "Autre motif",
];

export const PRESET_DURATIONS = [
  { label: "1 heure", hours: 1 },
  { label: "4 heures", hours: 4 },
  { label: "24 heures", hours: 24 },
];

interface DurationPickerProps {
  durationMode: "preset" | "custom";
  presetDurationHours: number;
  customDateTime: string;
  onSetDurationMode: (mode: "preset" | "custom") => void;
  onSetPresetHours: (hours: number) => void;
  onSetCustomDateTime: (val: string) => void;
}

export function DurationPicker({
  durationMode,
  presetDurationHours,
  customDateTime,
  onSetDurationMode,
  onSetPresetHours,
  onSetCustomDateTime,
}: DurationPickerProps) {
  return (
    <div className="space-y-2 pt-2 border-t border-border">
      <label className="font-semibold text-foreground flex items-center gap-1.5">
        <Clock className="size-3.5 text-muted-foreground" />
        <span>Durée de la pause (reprise automatique)</span>
      </label>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onSetDurationMode("preset")}
          className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold ${
            durationMode === "preset"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-surface border-border text-muted-foreground hover:bg-secondary"
          }`}
        >
          Durée prédéfinie
        </button>
        <button
          type="button"
          onClick={() => onSetDurationMode("custom")}
          className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold ${
            durationMode === "custom"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-surface border-border text-muted-foreground hover:bg-secondary"
          }`}
        >
          Date précise
        </button>
      </div>

      {durationMode === "preset" ? (
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 min-w-0">
          {PRESET_DURATIONS.map((item) => (
            <button
              key={item.hours}
              type="button"
              onClick={() => onSetPresetHours(item.hours)}
              className={`py-2 px-1.5 rounded-lg border text-xs font-medium transition min-w-0 truncate text-center cursor-pointer ${
                presetDurationHours === item.hours
                  ? "bg-primary/10 border-primary text-primary font-bold"
                  : "bg-surface border-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : (
        <input
          type="datetime-local"
          value={customDateTime}
          onChange={(e) => onSetCustomDateTime(e.target.value)}
          className="w-full min-w-0 max-w-full h-9 px-3 rounded-lg border border-input bg-background text-base sm:text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      )}
    </div>
  );
}
