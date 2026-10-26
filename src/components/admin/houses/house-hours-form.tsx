"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { updateHouseHoursAction } from "@/actions/admin-house.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check } from "lucide-react";
import type { HouseHourRecord } from "@/dal";

interface HouseHoursFormProps {
  houseId: string;
  hours: HouseHourRecord[];
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

export function HouseHoursForm({ houseId, hours }: HouseHoursFormProps) {
  const t = useTranslations("admin.houses");
  const [schedule, setSchedule] = useState(() => {
    return DAYS.map((d) => {
      const existing = hours.find((h) => h.weekday === d.day);
      return {
        weekday: d.day,
        label: d.label,
        enabled: !!existing,
        opensAt: existing?.opensAt ?? "08:00",
        closesAt: existing?.closesAt ?? "18:00",
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
        opensAt: s.opensAt,
        closesAt: s.closesAt,
      }));

    const res = await updateHouseHoursAction(houseId, payload);
    setLoading(false);
    if (!res.ok) {
      setMsg(res.error);
    } else {
      setMsg("Horaires enregistrés avec succès");
    }
  }

  return (
    <div className="space-y-4">
      <div className="font-bold text-sm text-foreground">{t("hoursTab")}</div>
      {msg && (
        <Alert className="border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10">
          <Check className="size-4" />
          <AlertDescription className="font-semibold">{msg}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        {schedule.map((item, idx) => (
          <div key={item.weekday} className="flex items-center gap-4 text-xs py-2 border-b border-border">
            <label className="w-28 flex items-center gap-2 font-semibold text-foreground cursor-pointer">
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
                  value={item.opensAt}
                  onChange={(e) => {
                    const copy = [...schedule];
                    copy[idx]!.opensAt = e.target.value;
                    setSchedule(copy);
                  }}
                  className="h-8 w-28 text-xs"
                />
                <span className="text-muted-foreground">à</span>
                <Input
                  type="time"
                  value={item.closesAt}
                  onChange={(e) => {
                    const copy = [...schedule];
                    copy[idx]!.closesAt = e.target.value;
                    setSchedule(copy);
                  }}
                  className="h-8 w-28 text-xs"
                />
              </div>
            ) : (
              <span className="text-muted-foreground italic">Fermé</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-3">
        <Button onClick={handleSave} disabled={loading} size="sm" className="h-9">
          {loading ? "..." : "Enregistrer les horaires"}
        </Button>
      </div>
    </div>
  );
}
