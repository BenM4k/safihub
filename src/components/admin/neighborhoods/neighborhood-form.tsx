"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createNeighborhoodAction } from "@/actions/admin-coverage.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ZoneRecord } from "@/dal";

interface NeighborhoodFormProps {
  zones: ZoneRecord[];
}

export function NeighborhoodForm({ zones }: NeighborhoodFormProps) {
  const t = useTranslations("admin.neighborhoods");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("served");

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    try {
      const res = await createNeighborhoodAction(formData);
      if (!res.ok) {
        setError(res.error);
      } else {
        (document.getElementById("neigh-form-el") as HTMLFormElement)?.reset();
        setStatus("served");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      id="neigh-form-el"
      action={handleSubmit}
      className="p-4 bg-slate-50/80 rounded-lg border border-border space-y-3"
    >
      <div className="font-bold text-xs text-heading">{t("addNeighborhood")}</div>
      {error && <div className="text-xs text-destructive">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="neighName" className="text-xs">
            {t("neighborhoodName")}
          </Label>
          <Input
            id="neighName"
            name="name"
            required
            placeholder="ex: La Botte, Ndendere, Panzi..."
            className="h-9 text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="neighZone" className="text-xs">
            {t("selectZone")}
          </Label>
          <select
            id="neighZone"
            name="zoneId"
            required
            className="h-9 w-full rounded-md border border-input bg-white px-3 text-xs text-heading"
          >
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="neighStatus" className="text-xs">
            {t("status")}
          </Label>
          <select
            id="neighStatus"
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-white px-3 text-xs text-heading"
          >
            <option value="served">{t("served")}</option>
            <option value="paused">{t("paused")}</option>
            <option value="not_served">{t("notServed")}</option>
          </select>
        </div>

        {status === "paused" && (
          <div className="space-y-1 sm:col-span-4">
            <Label htmlFor="neighPauseReason" className="text-xs">
              {t("pauseReason")} (obligatoire si suspendu - AC 19)
            </Label>
            <Input
              id="neighPauseReason"
              name="pauseReason"
              required
              placeholder="ex: Travaux de voirie, route impraticable..."
              className="h-9 text-xs"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading} size="sm" className="h-9">
          {loading ? "..." : t("save")}
        </Button>
      </div>
    </form>
  );
}
