"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { recordDailyExchangeRateAction } from "@/actions/admin-settings.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

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

    try {
      const fd = new FormData();
      fd.append("rate", rate);
      fd.append("effectiveDate", effectiveDate);

      const res = await recordDailyExchangeRateAction(fd);
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
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">{t("exchangeRateTitle")}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Enregistre le taux officiel du jour. Toute nouvelle commande en USD fige ce taux.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
          <AlertDescription className="text-xs font-semibold">Taux de change enregistré avec succès.</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="dailyRate" className="text-xs font-semibold text-foreground">
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
              <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-semibold">
                CDF
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="effectiveDate" className="text-xs font-semibold text-foreground">
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
            className="text-xs"
          >
            {loading ? "Enregistrement..." : t("saveRate")}
          </Button>
        </div>
      </form>

    </div>
  );
}
