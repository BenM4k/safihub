"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";
import { createNeighborhoodAction } from "@/actions/admin-coverage.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ZoneRecord } from "@/dal";

interface NeighborhoodFormProps {
  zones: ZoneRecord[];
}

export function NeighborhoodForm({ zones }: NeighborhoodFormProps) {
  const t = useTranslations("admin.neighborhoods");
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [zoneId, setZoneId] = useState(zones[0]?.id ?? "");
  const [status, setStatus] = useState("served");

  async function handleSubmit(formData: FormData) {
    setError(null);
    if (!zoneId) {
      setError(t("selectZoneRequired"));
      return;
    }

    setLoading(true);
    try {
      const res = await createNeighborhoodAction(formData);
      if (!res.ok) {
        setError(res.error);
      } else {
        formRef.current?.reset();
        setZoneId(zones[0]?.id ?? "");
        setStatus("served");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("unexpectedError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="p-4 bg-muted/20 rounded-lg border border-border space-y-3"
    >
      <input type="hidden" name="zoneId" value={zoneId} />
      <input type="hidden" name="status" value={status} />

      <div className="font-bold text-xs text-foreground">
        {t("addNeighborhood")}
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="space-y-1 sm:col-span-2">
          <Label
            htmlFor="neighName"
            className="text-xs font-semibold text-foreground"
          >
            {t("neighborhoodName")}
          </Label>
          <Input
            id="neighName"
            name="name"
            required
            placeholder={t("neighborhoodNamePlaceholder")}
            className="h-10 text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label
            htmlFor="neighZone"
            className="text-xs font-semibold text-foreground"
          >
            {t("selectZone")}
          </Label>
          <Select value={zoneId || undefined} onValueChange={setZoneId}>
            <SelectTrigger
              id="neighZone"
              className="h-10 w-full bg-card border-border text-xs"
              aria-label={t("selectZone")}
            >
              <SelectValue placeholder={t("selectZone")} />
            </SelectTrigger>
            <SelectContent>
              {zones.map((z) => (
                <SelectItem key={z.id} value={z.id}>
                  {z.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label
            htmlFor="neighStatus"
            className="text-xs font-semibold text-foreground"
          >
            {t("status")}
          </Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger
              id="neighStatus"
              className="h-10 w-full bg-card border-border text-xs"
              aria-label={t("status")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="served">{t("served")}</SelectItem>
              <SelectItem value="paused">{t("paused")}</SelectItem>
              <SelectItem value="not_served">{t("notServed")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {status === "paused" && (
          <div className="space-y-1 sm:col-span-4">
            <Label
              htmlFor="neighPauseReason"
              className="text-xs font-semibold text-foreground"
            >
              {t("pauseReasonRequiredLabel")}
            </Label>
            <Input
              id="neighPauseReason"
              name="pauseReason"
              required
              placeholder={t("pauseReasonPlaceholder")}
              className="h-10 text-xs"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end pt-1">
        <Button
          type="submit"
          disabled={loading}
          size="sm"
          className="min-h-10 press"
        >
          {loading ? "..." : t("save")}
        </Button>
      </div>
    </form>
  );
}
