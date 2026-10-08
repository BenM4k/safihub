"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { updateCourierShiftsAction } from "@/actions/admin-courier.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CourierShiftRecord } from "@/dal";

interface CourierShiftsFormProps {
  courierId: string;
  shifts: CourierShiftRecord[];
}

const DAYS = [
  { day: 1, label: "Lundi" },
  { day: 2, label: "Mardi" },
  { day: 3, label: "Mercredi" },
  { day: 4, label: "Jeudi" },
  { day: 5, label: "Vendredi" },
  { day: 6, label: "Samedi" },
  { day: 7, label: "Dimanche" },
];

export function CourierShiftsForm({ courierId, shifts }: CourierShiftsFormProps) {
  const t = useTranslations("admin.couriers");
  const [schedule, setSchedule] = useState(() => {
    return DAYS.map((d) => {
      const existing = shifts.find((s) => s.weekday === d.day);
      return {
        weekday: d.day,
        label: d.label,
        enabled: !!existing,
        startsAt: existing?.startsAt ?? "08:00",
        endsAt: existing?.endsAt ?? "18:00",
      };
    });
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSave() {
    setLoading(true);
    setMsg(null);
    const payload = schedule
      .filter((s) => s.enabled)
      .map((s) => ({
        weekday: s.weekday,
        startsAt: s.startsAt,
        endsAt: s.endsAt,
      }));

    const res = await updateCourierShiftsAction(courierId, payload);
    setLoading(false);
    if (!res.ok) {
      setMsg(res.error);
    } else {
      setMsg("Créneaux de travail enregistrés avec succès");
    }
  }

  return (
    <div className="p-5 bg-white rounded-xl border border-border shadow-xs space-y-4">
      <div className="font-bold text-sm text-heading">{t("shiftsTab")}</div>
      {msg && <div className="text-xs text-primary font-semibold">{msg}</div>}

      <div className="space-y-3">
        {schedule.map((item, idx) => (
          <div key={item.weekday} className="flex items-center gap-4 text-xs py-1 border-b border-border/60">
            <label className="w-28 flex items-center gap-2 font-semibold text-heading cursor-pointer">
              <input
                type="checkbox"
                checked={item.enabled}
                onChange={(e) => {
                  const copy = [...schedule];
                  copy[idx]!.enabled = e.target.checked;
                  setSchedule(copy);
                }}
                className="rounded"
              />
              <span>{item.label}</span>
            </label>

            {item.enabled ? (
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={item.startsAt}
                  onChange={(e) => {
                    const copy = [...schedule];
                    copy[idx]!.startsAt = e.target.value;
                    setSchedule(copy);
                  }}
                  className="h-8 w-28 text-xs"
                />
                <span className="text-muted-foreground">à</span>
                <Input
                  type="time"
                  value={item.endsAt}
                  onChange={(e) => {
                    const copy = [...schedule];
                    copy[idx]!.endsAt = e.target.value;
                    setSchedule(copy);
                  }}
                  className="h-8 w-28 text-xs"
                />
              </div>
            ) : (
              <span className="text-muted-foreground italic">Pas de garde</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={loading} size="sm" className="h-9">
          {loading ? "..." : "Enregistrer les créneaux"}
        </Button>
      </div>
    </div>
  );
}
