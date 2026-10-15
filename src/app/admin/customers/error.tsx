"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminCustomersErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminCustomersError({
  error,
  reset,
}: AdminCustomersErrorProps) {
  const t = useTranslations("admin.customers");

  useEffect(() => {
    console.error("Admin customers page error:", error);
  }, [error]);

  return (
    <div
      role="alert"
      className="p-8 my-8 bg-card rounded-2xl border-2 border-border-strong shadow-xs max-w-xl mx-auto space-y-4 text-center"
    >
      <div className="size-12 rounded-xl bg-destructive-light text-destructive-base border-2 border-destructive-base/30 flex items-center justify-center mx-auto">
        <AlertCircle className="size-6" />
      </div>

      <div className="space-y-1.5">
        <h2 className="text-base font-bold text-heading font-display">
          {t("errorTitle")}
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t("errorDescription")}
        </p>
      </div>

      <div className="pt-2">
        <Button
          type="button"
          onClick={reset}
          className="min-h-[40px] px-5 text-xs font-semibold gap-2 bg-primary hover:bg-primary-hover text-white cursor-pointer border-2 border-primary"
        >
          <RotateCcw className="size-4" />
          <span>{t("retry")}</span>
        </Button>
      </div>
    </div>
  );
}
