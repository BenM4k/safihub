"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { updatePlatformSettingsAction } from "@/actions/admin-settings.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SettingsRecord } from "@/dal";

interface PlatformSettingsFormProps {
  settings: SettingsRecord;
}

export function PlatformSettingsForm({ settings }: PlatformSettingsFormProps) {
  const t = useTranslations("admin.settings");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [commissionBps, setCommissionBps] = useState(settings.defaultCommissionBps);
  const [acceptanceDelay, setAcceptanceDelay] = useState(settings.acceptanceDelayMinutes);
  const [receptionWindow, setReceptionWindow] = useState(settings.receptionWindowMinutes);
  const [slotLength, setSlotLength] = useState(settings.slotLengthMinutes);
  const [maxDistance, setMaxDistance] = useState(settings.maxCoverageDistanceLevel);
  const [cashCeiling, setCashCeiling] = useState(settings.defaultCashCeiling ?? "");
  const [courierPay, setCourierPay] = useState(settings.defaultCourierPayPerLeg ?? "");
  const [firstOrderScreening, setFirstOrderScreening] = useState(settings.firstOrderScreening);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const fd = new FormData();
      fd.append("defaultCommissionBps", String(commissionBps));
      fd.append("acceptanceDelayMinutes", String(acceptanceDelay));
      fd.append("receptionWindowMinutes", String(receptionWindow));
      fd.append("slotLengthMinutes", String(slotLength));
      fd.append("maxCoverageDistanceLevel", String(maxDistance));
      fd.append("defaultCashCeiling", String(cashCeiling));
      fd.append("defaultCourierPayPerLeg", String(courierPay));
      fd.append("firstOrderScreening", String(firstOrderScreening));

      const res = await updatePlatformSettingsAction(fd);
      if (!res.ok) {
        setError(res.error);
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-[#EAECF0] bg-white p-5 shadow-sm space-y-4">
      <div>
        <h2 className="text-base font-semibold text-[#101828]">{t("platformConfigTitle")}</h2>
        <p className="text-xs text-[#667085]">
          Les nouvelles valeurs s&apos;appliquent immédiatement aux prochaines commandes. Les commandes existantes conservent leurs valeurs gelées.
        </p>
      </div>

      {error && <div className="p-3 bg-[#FEF3F2] border border-[#FECDCA] rounded text-xs text-[#B42318]">{error}</div>}
      {success && <div className="p-3 bg-[#ECFDF3] border border-[#D1FADF] rounded text-xs text-[#027A48]">Paramètres enregistrés avec succès.</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="comm" className="text-xs text-[#344054]">
              {t("defaultCommission")} (ex: 1500 = 15%)
            </Label>
            <Input
              id="comm"
              type="number"
              min={0}
              max={10000}
              value={commissionBps}
              onChange={(e) => setCommissionBps(Number(e.target.value))}
              required
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="accept" className="text-xs text-[#344054]">
              {t("acceptanceDelay")}
            </Label>
            <Input
              id="accept"
              type="number"
              min={15}
              value={acceptanceDelay}
              onChange={(e) => setAcceptanceDelay(Number(e.target.value))}
              required
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="recep" className="text-xs text-[#344054]">
              {t("receptionWindow")}
            </Label>
            <Input
              id="recep"
              type="number"
              min={15}
              value={receptionWindow}
              onChange={(e) => setReceptionWindow(Number(e.target.value))}
              required
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slot" className="text-xs text-[#344054]">
              {t("slotLength")}
            </Label>
            <Input
              id="slot"
              type="number"
              min={15}
              value={slotLength}
              onChange={(e) => setSlotLength(Number(e.target.value))}
              required
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dist" className="text-xs text-[#344054]">
              {t("maxDistance")} (Niveau 1, 2 ou 3)
            </Label>
            <Input
              id="dist"
              type="number"
              min={1}
              max={3}
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              required
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ceil" className="text-xs text-[#344054]">
              Plafond d&apos;encaisse par défaut (CDF)
            </Label>
            <Input
              id="ceil"
              type="number"
              value={cashCeiling}
              onChange={(e) => setCashCeiling(e.target.value)}
              placeholder="Ex: 50000"
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pay" className="text-xs text-[#344054]">
              Rémunération coursier par trajet (CDF)
            </Label>
            <Input
              id="pay"
              type="number"
              value={courierPay}
              onChange={(e) => setCourierPay(e.target.value)}
              placeholder="Ex: 2500"
              className="text-xs"
            />
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              id="screening"
              type="checkbox"
              checked={firstOrderScreening}
              onChange={(e) => setFirstOrderScreening(e.target.checked)}
              className="h-4 w-4 rounded border-[#D0D5DD] text-[#2824D5] focus:ring-[#2824D5]"
            />
            <Label htmlFor="screening" className="text-xs text-[#344054] cursor-pointer">
              Filtrage / screening systématique des premières commandes
            </Label>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-[#EAECF0]">
          <Button type="submit" disabled={loading} className="text-xs bg-[#2824D5] hover:bg-[#1E1B9E] text-white">
            {loading ? "Enregistrement..." : t("saveConfig")}
          </Button>
        </div>
      </form>
    </div>
  );
}
