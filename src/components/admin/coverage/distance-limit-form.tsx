"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { updateGlobalDistanceLimitAction } from "@/actions/admin-coverage.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

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
      className="p-5 bg-card rounded-xl border border-border shadow-xs space-y-3"
    >
      <div>
        <h2 className="text-sm font-bold text-foreground">
          {t("globalDistanceLimitTitle")}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t("globalDistanceLimitDesc")}
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
          <AlertDescription className="text-xs font-semibold">{success}</AlertDescription>
        </Alert>
      )}

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
