"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { setZoneFeePairAction } from "@/actions/admin-coverage.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { ZoneRecord } from "@/dal";

interface FeePairFormProps {
  zones: ZoneRecord[];
}

export function FeePairForm({ zones }: FeePairFormProps) {
  const t = useTranslations("admin.deliveryFees");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    try {
      const res = await setZoneFeePairAction(formData);
      if (!res.ok) {
        setError(res.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      action={handleSubmit}
      className="p-5 bg-card rounded-xl border border-border shadow-xs space-y-4"
    >
      <div className="font-bold text-sm text-foreground">{t("addPairTitle")}</div>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="space-y-1">
          <Label htmlFor="custZone" className="text-xs font-semibold text-foreground">
            {t("customerZone")}
          </Label>
          <select
            id="custZone"
            name="customerZoneId"
            required
            className="h-9 w-full rounded-md border border-input bg-card px-3 text-xs text-foreground"
          >
            <option value="">-- Choisir zone --</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="houseZone" className="text-xs font-semibold text-foreground">
            {t("houseZone")}
          </Label>
          <select
            id="houseZone"
            name="houseZoneId"
            required
            className="h-9 w-full rounded-md border border-input bg-card px-3 text-xs text-foreground"
          >
            <option value="">-- Choisir zone --</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="deliveryFee" className="text-xs font-semibold text-foreground">
            {t("deliveryFee")}
          </Label>
          <Input
            id="deliveryFee"
            name="deliveryFee"
            type="number"
            min="0"
            step="100"
            required
            placeholder="ex: 2500"
            className="h-9 text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="distLevel" className="text-xs font-semibold text-foreground">
            {t("distanceLevel")}
          </Label>
          <Input
            id="distLevel"
            name="distanceLevel"
            type="number"
            min="1"
            max="3"
            required
            defaultValue="1"
            className="h-9 text-xs"
          />
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <Button type="submit" disabled={loading} size="sm" className="h-9">
          {loading ? "..." : t("savePair")}
        </Button>
      </div>
    </form>

  );
}
