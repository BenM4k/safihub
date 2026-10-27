"use client";

import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { TimePickerSelect } from "./time-picker-select";
import { validateDayRanges, type DaySchedule } from "@/lib/hours-utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

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
    <div className="p-3 sm:p-3.5 transition-colors hover:bg-muted/30 border-b border-border/60 last:border-b-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Day identity and open switch */}
        <div className="flex items-center justify-between sm:justify-start gap-3 min-w-40">
          <div className="flex items-center gap-3">
            <Switch
              checked={day.isOpen}
              disabled={disabled}
              onCheckedChange={() => onToggleOpen(day.weekday)}
              aria-label={t("openDayLabel", { day: day.name.toLowerCase() })}
            />
            <span className="font-bold text-xs sm:text-sm text-heading font-display">
              {day.name}
            </span>
          </div>
          {!day.isOpen && (
            <Badge variant="outline" className="sm:hidden px-2 py-0.5 text-2xs font-bold text-muted-foreground">
              {t("closed")}
            </Badge>
          )}
        </div>

        {/* Time ranges or Closed badge */}
        {day.isOpen ? (
          <div className="flex-1 flex flex-col items-start sm:items-end gap-2.5">
            {day.ranges.map((range, idx) => (
              <div
                key={idx}
                className="flex flex-wrap items-center gap-2 w-full sm:w-auto"
                aria-describedby={validationError ? errorId : undefined}
              >
                <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                  <TimePickerSelect
                    value={range.opensAt}
                    onChange={(val) => onUpdateRange(day.weekday, idx, "opensAt", val)}
                    label={t("openingTimeLabel", { day: day.name.toLowerCase() })}
                    disabled={disabled}
                    error={Boolean(validationError)}
                  />
                  <span className="text-muted-foreground font-semibold px-0.5" aria-hidden="true">
                    —
                  </span>
                  <TimePickerSelect
                    value={range.closesAt}
                    onChange={(val) => onUpdateRange(day.weekday, idx, "closesAt", val)}
                    label={t("closingTimeLabel", { day: day.name.toLowerCase() })}
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
                    aria-label={t("deleteSlotAria", { day: day.name })}
                    className="h-10 w-10 sm:h-8 sm:w-8 p-0 text-destructive hover:bg-destructive-soft hover:text-destructive shrink-0 cursor-pointer rounded-xl"
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
                    aria-label={t("addSlotAria", { day: day.name })}
                    className="h-10 sm:h-8 px-3 text-xs text-primary font-semibold hover:bg-primary-soft shrink-0 cursor-pointer rounded-xl"
                  >
                    <Plus className="size-3.5 mr-1" aria-hidden="true" />
                    <span>{t("addSlot")}</span>
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="hidden sm:flex items-center">
            <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
              {t("closed")}
            </Badge>
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
