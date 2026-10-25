"use client";

import { Clock, Calendar, AlertCircle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toBukavuDateTime } from "@/services/availability";
import type { TimeSlot } from "@/services/availability";

interface SlotPickerProps {
  slots: TimeSlot[];
  isLoading: boolean;
  neighborhoodSelected: boolean;
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  nextProposedSlot?: TimeSlot | null;
  onAcceptProposedSlot?: (slot: TimeSlot) => void;
}

function formatSlotLabel(slot: TimeSlot): string {
  const start = new Date(slot.start);
  const end = new Date(slot.end);
  const startLocal = toBukavuDateTime(start);
  const endLocal = toBukavuDateTime(end);

  const nowLocal = toBukavuDateTime(new Date());
  let dayLabel: string;

  if (startLocal.dateString === nowLocal.dateString) {
    dayLabel = "Aujourd'hui";
  } else {
    const tomorrowLocal = toBukavuDateTime(new Date(Date.now() + 24 * 60 * 60 * 1000));
    if (startLocal.dateString === tomorrowLocal.dateString) {
      dayLabel = "Demain";
    } else {
      dayLabel = start.toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
      });
    }
  }

  const startFormatted = startLocal.timeString.replace(":", "h");
  const endFormatted = endLocal.timeString.replace(":", "h");

  return `${dayLabel} · ${startFormatted} - ${endFormatted}`;
}

export function SlotPicker({
  slots,
  isLoading,
  neighborhoodSelected,
  selectedSlot,
  onSelectSlot,
  nextProposedSlot,
  onAcceptProposedSlot,
}: SlotPickerProps) {
  const t = useTranslations("checkout");

  const isSelected = (slot: TimeSlot) => {
    if (!selectedSlot) return false;
    return new Date(selectedSlot.start).getTime() === new Date(slot.start).getTime();
  };

  return (
    <div className="p-5 bg-card rounded-2xl border border-border shadow-2xs space-y-3">
      <div className="flex items-center gap-2 text-sm font-bold text-heading border-b border-border pb-2">
        <Calendar className="size-4 text-primary" />
        <span>{t("stepPickup")}</span>
      </div>

      {nextProposedSlot && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs space-y-2 animate-in fade-in-50">
          <div className="flex items-start gap-2">
            <AlertCircle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{t("nextAvailableSlotNotice")}</p>
              <p className="mt-0.5 text-amber-700/90 dark:text-amber-400/90">
                {new Date(nextProposedSlot.start).toLocaleString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          {onAcceptProposedSlot && (
            <button
              type="button"
              onClick={() => onAcceptProposedSlot(nextProposedSlot)}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition cursor-pointer"
            >
              {t("acceptNextSlot")}
            </button>
          )}
        </div>
      )}

      {!neighborhoodSelected ? (
        <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
          {t("selectNeighborhoodFirst")}
        </div>
      ) : isLoading ? (
        <div className="p-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-primary" />
          <span>{t("slotsLoading")}</span>
        </div>
      ) : slots.length === 0 ? (
        <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
          {t("noSlotsAvailable")}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {slots.map((slot, idx) => {
            const active = isSelected(slot);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectSlot(slot)}
                className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs transition cursor-pointer ${
                  active
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                    : "border-border bg-muted/40 hover:border-border-strong text-muted-foreground hover:text-foreground font-medium"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className={`size-3.5 ${active ? "text-primary" : "text-muted-foreground/70"}`} />
                  <span>{formatSlotLabel(slot)}</span>
                </div>
                {active && <span className="size-2 rounded-full bg-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
