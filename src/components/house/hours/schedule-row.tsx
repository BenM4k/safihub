"use client";

import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { TimePickerSelect } from "./time-picker-select";
import { validateDayRanges, type DaySchedule } from "@/lib/hours-utils";
import { Button } from "@/components/ui/button";

interface ScheduleRowProps {
  day: DaySchedule;
  onToggleOpen: (weekday: number) => void;
  onUpdateRange: (weekday: number, rangeIndex: number, field: "opensAt" | "closesAt", value: string) => void;
  onAddRange: (weekday: number) => void;
  onRemoveRange: (weekday: number, rangeIndex: number) => void;
  disabled?: boolean;
}

export function ScheduleRow({
  day,
  onToggleOpen,
  onUpdateRange,
  onAddRange,
  onRemoveRange,
  disabled = false,
}: ScheduleRowProps) {
  const t = useTranslations("house.hours");
  const validationError = day.isOpen ? validateDayRanges(day.ranges) : null;
  const errorId = `error-day-${day.weekday}`;

  return (
    <div className="p-3.5 sm:p-4 transition-colors hover:bg-surface/50 border-b border-border last:border-b-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Day identity and open switch */}
        <div className="flex items-center gap-3 min-w-40">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={day.isOpen}
              disabled={disabled}
              onChange={() => onToggleOpen(day.weekday)}
              aria-label={`Ouvert le ${day.name.toLowerCase()}`}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-secondary peer-focus:outline-hidden peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-2xs" />
          </label>
          <span className="font-bold text-xs sm:text-sm text-heading font-display">
            {day.name}
          </span>
        </div>

        {/* Time ranges or Closed badge */}
        {day.isOpen ? (
          <div className="flex-1 flex flex-col items-start sm:items-end gap-2">
            {day.ranges.map((range, idx) => (
              <div
                key={idx}
                className="flex flex-wrap items-center gap-2 w-full sm:w-auto"
                aria-describedby={validationError ? errorId : undefined}
              >
                <div className="flex items-center gap-1.5">
                  <TimePickerSelect
                    value={range.opensAt}
                    onChange={(val) => onUpdateRange(day.weekday, idx, "opensAt", val)}
                    label={`Heure d'ouverture, ${day.name.toLowerCase()}${day.ranges.length > 1 ? ` (plage ${idx + 1})` : ""}`}
                    disabled={disabled}
                    error={Boolean(validationError)}
                  />
                  <span className="text-muted-foreground font-semibold px-0.5" aria-hidden="true">
                    —
                  </span>
                  <TimePickerSelect
                    value={range.closesAt}
                    onChange={(val) => onUpdateRange(day.weekday, idx, "closesAt", val)}
                    label={`Heure de fermeture, ${day.name.toLowerCase()}${day.ranges.length > 1 ? ` (plage ${idx + 1})` : ""}`}
                    disabled={disabled}
                    error={Boolean(validationError)}
                  />
                </div>

                {/* Range actions: remove second slot or add second slot */}
                {idx > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveRange(day.weekday, idx)}
                    disabled={disabled}
                    aria-label={`Supprimer la 2ème plage de ${day.name}`}
                    className="h-9 px-2 text-destructive hover:bg-destructive-soft hover:text-destructive shrink-0 cursor-pointer"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                )}

                {idx === 0 && day.ranges.length === 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddRange(day.weekday)}
                    disabled={disabled}
                    aria-label={`Ajouter une 2ème plage pour ${day.name}`}
                    className="h-9 px-2.5 text-xs text-primary font-semibold hover:bg-primary-soft shrink-0 cursor-pointer"
                  >
                    <Plus className="size-3.5 mr-1" aria-hidden="true" />
                    <span>{t("addSlot")}</span>
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-secondary text-muted-foreground border border-border">
              {t("closed")}
            </span>
          </div>
        )}
      </div>

      {/* Inline validation error */}
      {validationError && (
        <p
          id={errorId}
          role="alert"
          className="text-xs text-destructive font-semibold mt-2 pt-1.5 border-t border-destructive/10"
        >
          {validationError}
        </p>
      )}
    </div>
  );
}
