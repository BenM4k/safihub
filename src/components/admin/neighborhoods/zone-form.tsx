"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createZoneAction } from "@/actions/admin-coverage.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function ZoneForm() {
  const t = useTranslations("admin.neighborhoods");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    const res = await createZoneAction(formData);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
    } else {
      (document.getElementById("zone-form-el") as HTMLFormElement)?.reset();
    }
  }

  return (
    <form
      id="zone-form-el"
      action={handleSubmit}
      className="p-4 bg-muted/20 rounded-lg border border-border space-y-3"
    >
      <div className="font-bold text-xs text-foreground">{t("addZone")}</div>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 space-y-1">
          <Label htmlFor="zoneName" className="text-xs font-semibold text-foreground">
            {t("zoneName")}
          </Label>
          <Input
            id="zoneName"
            name="name"
            required
            placeholder="ex: Commune d'Ibanda"
            className="h-9 text-xs"
          />
        </div>
        <div className="w-24 space-y-1">
          <Label htmlFor="sortOrder" className="text-xs font-semibold text-foreground">
            {t("sortOrder")}
          </Label>
          <Input
            id="sortOrder"
            name="sortOrder"
            type="number"
            defaultValue="0"
            className="h-9 text-xs"
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={loading} size="sm" className="h-9">
            {loading ? "..." : t("save")}
          </Button>
        </div>
      </div>
    </form>
  );
}
