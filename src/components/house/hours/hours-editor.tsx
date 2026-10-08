"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { updateHouseHoursAction } from "@/actions/house.actions";
import { Button } from "@/components/ui/button";
import type { HouseHourRecord } from "@/dal";

const WEEKDAYS = [
  { day: 1, name: "Lundi" },
  { day: 2, name: "Mardi" },
  { day: 3, name: "Mercredi" },
  { day: 4, name: "Jeudi" },
  { day: 5, name: "Vendredi" },
  { day: 6, name: "Samedi" },
  { day: 7, name: "Dimanche" },
];

export function HoursEditor({
  initialHours,
  houseId,
}: {
  initialHours: HouseHourRecord[];
  houseId?: string;
}) {
  const t = useTranslations("house.hours");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [schedule, setSchedule] = useState<
    Record<number, { isOpen: boolean; opensAt: string; closesAt: string }>
  >(() => {
    const map: Record<number, { isOpen: boolean; opensAt: string; closesAt: string }> = {};
    for (const w of WEEKDAYS) {
      const match = initialHours.find((h) => h.weekday === w.day);
      map[w.day] = {
        isOpen: Boolean(match),
        opensAt: match ? match.opensAt.slice(0, 5) : "08:00",
        closesAt: match ? match.closesAt.slice(0, 5) : "18:00",
      };
    }
    return map;
  });

  function toggleDay(weekday: number) {
    setSchedule((prev) => ({
      ...prev,
      [weekday]: { ...prev[weekday], isOpen: !prev[weekday].isOpen },
    }));
  }

  function updateTime(weekday: number, field: "opensAt" | "closesAt", val: string) {
    setSchedule((prev) => ({
      ...prev,
      [weekday]: { ...prev[weekday], [field]: val },
    }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const hoursPayload: Array<{ weekday: number; opensAt: string; closesAt: string }> = [];

    for (const w of WEEKDAYS) {
      const dayData = schedule[w.day];
      if (dayData.isOpen) {
        if (dayData.closesAt <= dayData.opensAt) {
          setErrorMsg(`${w.name}: L'heure de fermeture doit être après l'heure d'ouverture.`);
          return;
        }
        hoursPayload.push({
          weekday: w.day,
          opensAt: `${dayData.opensAt}:00`,
          closesAt: `${dayData.closesAt}:00`,
        });
      }
    }

    startTransition(async () => {
      const res = await updateHouseHoursAction({
        hours: hoursPayload,
        houseId,
      });

      if (!res.ok) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg("Horaires d'ouverture enregistrés avec succès.");
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">{t("weeklySchedule")}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{t("subtitle")}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
          {WEEKDAYS.map((w) => {
            const data = schedule[w.day];
            return (
              <div
                key={w.day}
                className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50"
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleDay(w.day)}
                    className={`size-6 rounded-md inline-flex items-center justify-center transition ${
                      data.isOpen ? "bg-violet-600 text-white" : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    <Check className="size-3.5" />
                  </button>
                  <span className="font-semibold text-xs sm:text-sm text-slate-800">
                    {w.name}
                  </span>
                </div>

                {data.isOpen ? (
                  <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
                    <span className="text-slate-400 text-[11px]">{t("opensAt")}</span>
                    <input
                      type="time"
                      value={data.opensAt}
                      onChange={(e) => updateTime(w.day, "opensAt", e.target.value)}
                      className="px-2 py-1 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600"
                    />
                    <span className="text-slate-400 text-[11px]">—</span>
                    <span className="text-slate-400 text-[11px]">{t("closesAt")}</span>
                    <input
                      type="time"
                      value={data.closesAt}
                      onChange={(e) => updateTime(w.day, "closesAt", e.target.value)}
                      className="px-2 py-1 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic self-end sm:self-auto">
                    {t("closed")}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {errorMsg && <p className="text-xs text-rose-600 font-semibold">{errorMsg}</p>}
        {successMsg && <p className="text-xs text-emerald-600 font-semibold">{successMsg}</p>}

        <Button
          type="submit"
          disabled={isPending}
          className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-xs"
        >
          {isPending ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : <Save className="size-3.5 mr-1.5" />}
          <span>{t("saveHours")}</span>
        </Button>
      </form>
    </div>
  );
}
