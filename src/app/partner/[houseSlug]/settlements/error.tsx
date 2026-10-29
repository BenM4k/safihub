"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function PartnerSettlementsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("house.settlements");

  useEffect(() => {
    console.error("Partner settlements error:", error);
  }, [error]);

  return (
    <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-8 text-center space-y-4 max-w-lg mx-auto my-12">
      <div className="size-12 rounded-full bg-destructive/20 text-destructive flex items-center justify-center mx-auto border border-destructive/30">
        <AlertCircle className="size-6" />
      </div>

      <div className="space-y-1">
        <h2 className="text-base font-bold text-foreground">
          {t("errorTitle")}
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t("errorDescription")}
        </p>
      </div>

      <Button
        type="button"
        onClick={reset}
        className="min-h-[44px] px-4 text-xs font-semibold gap-2 rounded-lg"
      >
        <RefreshCw className="size-3.5" />
        <span>{t("retryButton")}</span>
      </Button>
    </div>
  );
}
