"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function PartnerDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("house.dashboard.error");

  useEffect(() => {
    console.error("Partner dashboard error:", error);
  }, [error]);

  return (
    <div
      role="alert"
      className="rounded-3xl border border-destructive/20 bg-destructive-soft/50 p-6 sm:p-10 text-center max-w-xl mx-auto my-12 space-y-4"
    >
      <div className="size-14 rounded-2xl bg-destructive-soft text-destructive flex items-center justify-center mx-auto shadow-xs">
        <AlertTriangle className="size-7" />
      </div>

      <div className="space-y-1">
        <h2 className="font-display font-black text-lg text-heading">
          {t("title")}
        </h2>
        <p className="text-xs sm:text-sm text-foreground max-w-md mx-auto">
          {t("description")}
        </p>
      </div>

      <div className="pt-2">
        <Button
          type="button"
          onClick={() => reset()}
          className="rounded-xl font-bold bg-primary hover:bg-primary-hover text-primary-foreground text-xs px-5 h-10 gap-2 cursor-pointer"
        >
          <RotateCcw className="size-4" />
          <span>{t("retry")}</span>
        </Button>
      </div>
    </div>
  );
}
