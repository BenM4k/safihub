"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { updateGlobalDistanceLimitAction } from "@/actions/admin-coverage.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DistanceLimitFormProps {
  currentLimit: number;
}

export function DistanceLimitForm({ currentLimit }: DistanceLimitFormProps) {
  const t = useTranslations("admin.coverage");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await updateGlobalDistanceLimitAction(formData);
      if (!res.ok) {
        setError(res.error);
      } else {
        setSuccess("Limite globale mise à jour avec succès (AC 21)");
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
      className="p-5 bg-white rounded-xl border border-border shadow-xs space-y-3"
    >
      <div>
        <h2 className="text-sm font-bold text-heading">
          {t("globalDistanceLimitTitle")}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t("globalDistanceLimitDesc")}
        </p>
      </div>

      {error && <div className="text-xs text-destructive">{error}</div>}
      {success && <div className="text-xs text-emerald-600 font-semibold">{success}</div>}

      <div className="flex items-center gap-3">
        <div className="w-32">
          <Label htmlFor="maxDist" className="sr-only">
            {t("globalDistanceLimitTitle")}
          </Label>
          <Input
            id="maxDist"
            name="maxCoverageDistanceLevel"
            type="number"
            min="1"
            max="3"
            defaultValue={currentLimit}
            required
            className="h-9 text-xs"
          />
        </div>
        <Button type="submit" disabled={loading} size="sm" className="h-9">
          {loading ? "..." : t("saveLimit")}
        </Button>
      </div>
    </form>
  );
}
