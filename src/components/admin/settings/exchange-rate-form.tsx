"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { recordDailyExchangeRateAction } from "@/actions/admin-settings.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ExchangeRateFormProps {
  defaultEffectiveDate?: string;
}

function getFallbackBukavuDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lubumbashi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function ExchangeRateForm({
  defaultEffectiveDate,
}: ExchangeRateFormProps) {
  const t = useTranslations("admin.settings");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [rate, setRate] = useState("2850");
  const [effectiveDate, setEffectiveDate] = useState(
    () => defaultEffectiveDate ?? getFallbackBukavuDate()
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

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
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("unexpectedError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">
          {t("exchangeRateTitle")}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t("exchangeRateDesc")}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-success/20 bg-success-soft text-success">
          <CheckCircle2 className="size-4 text-success" />
          <AlertDescription className="text-xs font-semibold">
            {t("rateSavedSuccess")}
          </AlertDescription>
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
            className="text-xs min-h-10 press"
          >
            {loading ? t("saving") : t("saveRate")}
          </Button>
        </div>
      </form>
    </div>
  );
}
