"use client";

import { useMemo } from "react";
import { Clock, Calendar, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import type { TimeSlot } from "@/services/availability";

interface SlotOption {
  label: string;
  slot: TimeSlot;
}

interface SlotPickerProps {
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  nextProposedSlot?: TimeSlot | null;
  onAcceptProposedSlot?: (slot: TimeSlot) => void;
}

export function SlotPicker({
  selectedSlot,
  onSelectSlot,
  nextProposedSlot,
  onAcceptProposedSlot,
}: SlotPickerProps) {
  const t = useTranslations("checkout");

  // Generate standard upcoming 2-hour slots for Bukavu timezone
  const availableSlots: SlotOption[] = useMemo(() => {
    const slots: SlotOption[] = [];
    const now = new Date();

    for (let dayOffset = 0; dayOffset <= 3; dayOffset++) {
      const d = new Date(now);
      d.setDate(d.getDate() + dayOffset);
      const dayName =
        dayOffset === 0
          ? "Aujourd'hui"
          : dayOffset === 1
          ? "Demain"
          : d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" });

      const hours = [
        { startH: 8, endH: 10, label: "08h00 - 10h00" },
        { startH: 11, endH: 13, label: "11h00 - 13h00" },
        { startH: 14, endH: 16, label: "14h00 - 16h00" },
        { startH: 16, endH: 18, label: "16h00 - 18h00" },
      ];

      for (const h of hours) {
        const slotStart = new Date(d);
        slotStart.setHours(h.startH, 0, 0, 0);
        const slotEnd = new Date(d);
        slotEnd.setHours(h.endH, 0, 0, 0);

        if (slotStart.getTime() > now.getTime() + 30 * 60 * 1000) {
          slots.push({
            label: `${dayName} · ${h.label}`,
            slot: {
              start: slotStart,
              end: slotEnd,
            },
          });
        }
      }
    }
    return slots.slice(0, 8);
  }, []);

  const isSelected = (slot: TimeSlot) => {
    if (!selectedSlot) return false;
    return new Date(selectedSlot.start).getTime() === new Date(slot.start).getTime();
  };

  return (
    <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
        <Calendar className="size-4 text-primary" />
        <span>{t("stepPickup")}</span>
      </div>

      {/* AC 1: Next proposed slot banner if server rejected slot */}
      {nextProposedSlot && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2 animate-in fade-in-50">
          <div className="flex items-start gap-2">
            <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{t("nextAvailableSlotNotice")}</p>
              <p className="mt-0.5 text-amber-800">
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
              className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition"
            >
              {t("acceptNextSlot")}
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {availableSlots.map((opt, idx) => {
          const active = isSelected(opt.slot);
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectSlot(opt.slot)}
              className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs transition ${
                active
                  ? "border-primary bg-primary-soft/30 text-primary font-bold shadow-2xs"
                  : "border-slate-200 hover:border-slate-300 text-slate-700 font-medium"
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className={`size-3.5 ${active ? "text-primary" : "text-slate-400"}`} />
                <span>{opt.label}</span>
              </div>
              {active && <span className="size-2 rounded-full bg-primary" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
