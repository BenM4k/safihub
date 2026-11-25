"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { updatePlatformSettingsAction } from "@/actions/admin-settings.actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { SettingsRecord } from "@/dal";

interface PlatformSettingsFormProps {
  settings: SettingsRecord;
}

export function PlatformSettingsForm({ settings }: PlatformSettingsFormProps) {
  const t = useTranslations("admin.settings");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [commissionBps, setCommissionBps] = useState(
    settings.defaultCommissionBps
  );
  const [acceptanceDelay, setAcceptanceDelay] = useState(
    settings.acceptanceDelayMinutes
  );
  const [receptionWindow, setReceptionWindow] = useState(
    settings.receptionWindowMinutes
  );
  const [slotLength, setSlotLength] = useState(settings.slotLengthMinutes);
  const [maxDistance, setMaxDistance] = useState(
    settings.maxCoverageDistanceLevel
  );
  const [cashCeiling, setCashCeiling] = useState(
    settings.defaultCashCeiling ?? ""
  );
  const [courierPay, setCourierPay] = useState(
    settings.defaultCourierPayPerLeg ?? ""
  );
  const [firstOrderScreening, setFirstOrderScreening] = useState(
    settings.firstOrderScreening
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
          {t("platformConfigTitle")}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t("platformConfigDesc")}
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
            {t("settingsSavedSuccess")}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="comm" className="text-xs font-semibold text-foreground">
              {t("defaultCommission")} ({t("commissionHint")})
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
            <Label htmlFor="accept" className="text-xs font-semibold text-foreground">
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
            <Label htmlFor="recep" className="text-xs font-semibold text-foreground">
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
            <Label htmlFor="slot" className="text-xs font-semibold text-foreground">
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
            <Label htmlFor="dist" className="text-xs font-semibold text-foreground">
              {t("maxDistance")} ({t("maxDistanceHint")})
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
            <Label htmlFor="ceil" className="text-xs font-semibold text-foreground">
              {t("defaultCashCeilingLabel")}
            </Label>
            <Input
              id="ceil"
              type="number"
              value={cashCeiling}
              onChange={(e) => setCashCeiling(e.target.value)}
              placeholder={t("defaultCashCeilingPlaceholder")}
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pay" className="text-xs font-semibold text-foreground">
              {t("defaultCourierPayLabel")}
            </Label>
            <Input
              id="pay"
              type="number"
              value={courierPay}
              onChange={(e) => setCourierPay(e.target.value)}
              placeholder={t("defaultCourierPayPlaceholder")}
              className="text-xs"
            />
          </div>

          <div className="flex items-center gap-2.5 pt-6">
            <Checkbox
              id="screening"
              checked={firstOrderScreening}
              onCheckedChange={(checked) => setFirstOrderScreening(checked)}
            />
            <Label
              htmlFor="screening"
              className="text-xs font-medium text-foreground cursor-pointer"
            >
              {t("firstOrderScreeningLabel")}
            </Label>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-border">
          <Button type="submit" disabled={loading} className="text-xs min-h-10 press">
            {loading ? t("saving") : t("saveConfig")}
          </Button>
        </div>
      </form>
    </div>
  );
}
