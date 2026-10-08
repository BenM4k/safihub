"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { recordDailyExchangeRateAction } from "@/actions/admin-settings.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ExchangeRateForm() {
  const t = useTranslations("admin.settings");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];
  const [rate, setRate] = useState("2850");
  const [effectiveDate, setEffectiveDate] = useState(todayStr);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const fd = new FormData();
    fd.append("rate", rate);
    fd.append("effectiveDate", effectiveDate);

    const res = await recordDailyExchangeRateAction(fd);
    setLoading(false);

    if (!res.ok) {
      setError(res.error);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  return (
    <div className="rounded-xl border border-[#EAECF0] bg-white p-5 shadow-sm space-y-4">
      <div>
        <h2 className="text-base font-semibold text-[#101828]">{t("exchangeRateTitle")}</h2>
        <p className="text-xs text-[#667085]">
          Enregistre le taux officiel du jour. Toute nouvelle commande en USD fige ce taux.
        </p>
      </div>

      {error && <div className="p-3 bg-[#FEF3F2] border border-[#FECDCA] rounded text-xs text-[#B42318]">{error}</div>}
      {success && <div className="p-3 bg-[#ECFDF3] border border-[#D1FADF] rounded text-xs text-[#027A48]">Taux de change enregistré avec succès.</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="dailyRate" className="text-xs text-[#344054]">
              {t("dailyExchangeRate")}
            </Label>
            <div className="relative">
              <Input
                id="dailyRate"
                type="number"
                step="0.01"
                min={1}
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                required
                className="text-xs pr-12 font-mono font-medium"
              />
              <span className="absolute right-3 top-2.5 text-xs text-[#667085] font-semibold">
                CDF
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="effectiveDate" className="text-xs text-[#344054]">
              {t("effectiveDate")}
            </Label>
            <Input
              id="effectiveDate"
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              required
              className="text-xs font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={loading}
            className="text-xs bg-[#2824D5] hover:bg-[#1E1B9E] text-white"
          >
            {loading ? "Enregistrement..." : t("saveRate")}
          </Button>
        </div>
      </form>
    </div>
  );
}
