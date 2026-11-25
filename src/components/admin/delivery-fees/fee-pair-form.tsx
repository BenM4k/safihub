"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { setZoneFeePairAction } from "@/actions/admin-coverage.actions";
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

interface FeePairFormProps {
  zones: ZoneRecord[];
}

export function FeePairForm({ zones }: FeePairFormProps) {
  const t = useTranslations("admin.deliveryFees");
  const [customerZoneId, setCustomerZoneId] = useState("");
  const [houseZoneId, setHouseZoneId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!customerZoneId || !houseZoneId) {
      setError(t("selectBothZonesError"));
      return;
    }

    const formData = new FormData(e.currentTarget);
    setLoading(true);
    try {
      const res = await setZoneFeePairAction(formData);
      if (!res.ok) {
        setError(res.error);
      } else {
        setSuccess(t("pairSavedSuccess"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("unexpectedError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-5 bg-card rounded-xl border border-border shadow-xs space-y-4"
    >
      <input type="hidden" name="customerZoneId" value={customerZoneId} />
      <input type="hidden" name="houseZoneId" value={houseZoneId} />

      <div className="font-bold text-sm text-foreground">
        {t("addPairTitle")}
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
            {success}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="space-y-1">
          <Label
            htmlFor="custZone"
            className="text-xs font-semibold text-foreground"
          >
            {t("customerZone")}
          </Label>
          <Select
            value={customerZoneId || undefined}
            onValueChange={setCustomerZoneId}
          >
            <SelectTrigger
              id="custZone"
              className="h-10 w-full bg-card border-border text-xs"
              aria-label={t("customerZone")}
            >
              <SelectValue placeholder={t("chooseZone")} />
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
            htmlFor="houseZone"
            className="text-xs font-semibold text-foreground"
          >
            {t("houseZone")}
          </Label>
          <Select
            value={houseZoneId || undefined}
            onValueChange={setHouseZoneId}
          >
            <SelectTrigger
              id="houseZone"
              className="h-10 w-full bg-card border-border text-xs"
              aria-label={t("houseZone")}
            >
              <SelectValue placeholder={t("chooseZone")} />
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
            htmlFor="deliveryFee"
            className="text-xs font-semibold text-foreground"
          >
            {t("deliveryFee")}
          </Label>
          <Input
            id="deliveryFee"
            name="deliveryFee"
            type="number"
            min="0"
            step="100"
            required
            placeholder={t("deliveryFeePlaceholder")}
            className="h-10 text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label
            htmlFor="distLevel"
            className="text-xs font-semibold text-foreground"
          >
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
            className="h-10 text-xs"
          />
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <Button
          type="submit"
          disabled={loading}
          size="sm"
          className="min-h-10 press"
        >
          {loading ? "..." : t("savePair")}
        </Button>
      </div>
    </form>
  );
}
