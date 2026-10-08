"use client";

import { useState, useTransition } from "react";
import { Save, Loader2, PauseCircle, PlayCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { updateHouseGeneralSettingsAction } from "@/actions/house.actions";
import { Button } from "@/components/ui/button";
import type { HouseRecord } from "@/dal";

function formatLocalDatetime(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function GeneralSettingsForm({
  house,
}: {
  house: HouseRecord;
}) {
  const t = useTranslations("house.settings");
  const [isPending, startTransition] = useTransition();

  const [dailyCapacity, setDailyCapacity] = useState<string>(
    house.dailyCapacity !== null ? String(house.dailyCapacity) : ""
  );
  const [minimumOrderAmount, setMinimumOrderAmount] = useState<number>(
    house.minimumOrderAmount
  );
  const [isPaused, setIsPaused] = useState<boolean>(house.isPaused);
  const [pausedUntil, setPausedUntil] = useState<string>(
    formatLocalDatetime(house.pausedUntil)
  );
  const [addressNote, setAddressNote] = useState<string>(house.addressNote ?? "");
  const [contactPhone, setContactPhone] = useState<string>(house.contactPhone ?? "");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const parsedCap = dailyCapacity.trim() ? parseInt(dailyCapacity.trim()) : null;

    startTransition(async () => {
      const res = await updateHouseGeneralSettingsAction({
        houseId: house.id,
        dailyCapacity: parsedCap,
        minimumOrderAmount,
        isPaused,
        pausedUntil: isPaused && pausedUntil ? new Date(pausedUntil).toISOString() : null,
        addressNote: addressNote.trim() || null,
        contactPhone: contactPhone.trim() || null,
      });

      if (!res.ok) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg("Paramètres de l'atelier enregistrés avec succès.");
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5"
    >
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-900">{t("title")}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{t("subtitle")}</p>
      </div>

      {/* Emergency Pause Box */}
      <div
        className={`p-4 rounded-xl border transition ${
          isPaused
            ? "bg-amber-50 border-amber-300 text-amber-900"
            : "bg-slate-50 border-slate-200 text-slate-700"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {isPaused ? (
              <PauseCircle className="size-5 text-amber-600 shrink-0" />
            ) : (
              <PlayCircle className="size-5 text-emerald-600 shrink-0" />
            )}
            <div>
              <span className="font-bold text-xs block">{t("pauseTitle")}</span>
              <p className="text-[11px] text-slate-500">{t("pauseDesc")}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              isPaused
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
            }`}
          >
            {isPaused ? "En pause" : "Actif (cliquer pour pause)"}
          </button>
        </div>

        {isPaused && (
          <div className="mt-3 pt-3 border-t border-amber-200/60 text-xs">
            <label className="block text-[11px] font-semibold text-amber-800 mb-1">
              {t("pausedUntilLabel")}
            </label>
            <input
              type="datetime-local"
              value={pausedUntil}
              onChange={(e) => setPausedUntil(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 text-xs text-amber-900"
            />
          </div>
        )}
      </div>

      {/* Capacity & Minimum Order */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            {t("dailyCapacityLabel")}
          </label>
          <input
            type="number"
            min={1}
            value={dailyCapacity}
            onChange={(e) => setDailyCapacity(e.target.value)}
            placeholder="Illimité"
            className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            {t("minimumOrderLabel")}
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={0}
              step={500}
              value={minimumOrderAmount}
              onChange={(e) => setMinimumOrderAmount(parseInt(e.target.value) || 0)}
              className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600"
            />
            <span className="text-xs font-bold text-slate-500">CDF</span>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            {t("contactPhoneLabel")}
          </label>
          <input
            type="text"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="+243..."
            className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            {t("addressNoteLabel")}
          </label>
          <input
            type="text"
            value={addressNote}
            onChange={(e) => setAddressNote(e.target.value)}
            placeholder="Ex. Derrière la station d'essence..."
            className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600"
          />
        </div>
      </div>

      {errorMsg && <p className="text-xs text-rose-600 font-semibold">{errorMsg}</p>}
      {successMsg && <p className="text-xs text-emerald-600 font-semibold">{successMsg}</p>}

      <Button
        type="submit"
        disabled={isPending}
        className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-xs"
      >
        {isPending ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : <Save className="size-3.5 mr-1.5" />}
        <span>{t("saveSettings")}</span>
      </Button>
    </form>
  );
}
