"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { updateGlobalDistanceLimitAction } from "@/actions/admin-coverage.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
        setSuccess(t("limitUpdatedSuccess"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("unexpectedError"));
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
        <Alert className="border-success/20 bg-success-soft text-success">
          <CheckCircle2 className="size-4 text-success" />
          <AlertDescription className="text-xs font-semibold">
            {success}
          </AlertDescription>
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
            className="h-10 text-xs"
          />
        </div>
        <Button type="submit" disabled={loading} size="sm" className="min-h-10 press">
          {loading ? "..." : t("saveLimit")}
        </Button>
      </div>
    </form>
  );
}
