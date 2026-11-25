"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";
import { createZoneAction } from "@/actions/admin-coverage.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ZoneForm() {
  const t = useTranslations("admin.neighborhoods");
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    try {
      const res = await createZoneAction(formData);
      if (!res.ok) {
        setError(res.error);
      } else {
        formRef.current?.reset();
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
            placeholder={t("zoneNamePlaceholder")}
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
          <Button type="submit" disabled={loading} size="sm" className="h-9 press">
            {loading ? "..." : t("save")}
          </Button>
        </div>
      </div>
    </form>
  );
}
