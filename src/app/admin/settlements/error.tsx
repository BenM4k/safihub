"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SettlementsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SettlementsError({ error, reset }: SettlementsErrorProps) {
  const t = useTranslations("admin.settlements");

  useEffect(() => {
    console.error("Settlements page error:", error);
  }, [error]);

  return (
    <div className="p-8 bg-destructive-light/40 border-2 border-destructive-base/30 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 my-8">
      <div className="size-12 rounded-full bg-destructive-light flex items-center justify-center text-destructive-base border border-destructive-base/40">
        <AlertCircle className="size-6" />
      </div>

      <div className="space-y-1 max-w-md">
        <h2 className="text-base font-bold text-heading">
          {t("errorTitle")}
        </h2>
        <p className="text-xs text-muted-foreground">
          {t("errorDescription")}
        </p>
      </div>

      <Button
        onClick={() => reset()}
        className="min-h-[40px] px-4 font-semibold text-xs gap-1.5 shadow-xs"
      >
        <RotateCcw className="size-4" />
        <span>{t("retry")}</span>
      </Button>
    </div>
  );
}
