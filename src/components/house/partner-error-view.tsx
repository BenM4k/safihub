"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import * as Sentry from "@sentry/nextjs";
import { AlertCircle, RotateCcw, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PartnerErrorViewProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
  houseSlug?: string;
}

/**
 * Standard error state presentation for the partner workspace (/partner/[houseSlug]/*).
 */
export function PartnerErrorView({
  error,
  reset,
  title,
  description,
  houseSlug,
}: PartnerErrorViewProps) {
  const t = useTranslations("house.dashboard.error");
  const tNav = useTranslations("house.nav");
  const tErrors = useTranslations("errors");

  useEffect(() => {
    Sentry.captureException(error);
    console.error("Partner workspace error encountered:", error);
  }, [error]);

  const displayTitle = title || t("title");
  const displayDescription =
    description || error.message || t("description");

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="p-6 sm:p-8 my-10 bg-card rounded-2xl border border-destructive/30 shadow-xs max-w-xl mx-auto flex flex-col gap-4 text-center"
    >
      <div className="size-12 rounded-xl bg-destructive-soft text-destructive border border-destructive/30 flex items-center justify-center mx-auto shadow-2xs">
        <AlertCircle className="size-6" />
      </div>

      <div className="flex flex-col gap-1.5">
        <h2 className="text-base sm:text-lg font-bold text-heading font-display">
          {displayTitle}
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
          {displayDescription}
        </p>
      </div>

      {error.digest && (
        <div className="w-full max-w-xs mx-auto p-2 rounded-lg bg-surface border border-border text-[11px] font-mono text-muted-foreground select-all">
          {tErrors("referenceCode")} : {error.digest}
        </div>
      )}

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button
          type="button"
          onClick={() => reset()}
          className="min-h-[40px] px-5 text-xs font-semibold gap-2 bg-primary hover:bg-primary-hover text-primary-foreground cursor-pointer w-full sm:w-auto"
        >
          <RotateCcw className="size-4" />
          <span>{t("retry")}</span>
        </Button>

        {houseSlug && (
          <Button
            variant="outline"
            asChild
            className="min-h-[40px] px-5 text-xs font-semibold gap-2 border-border text-heading hover:bg-secondary w-full sm:w-auto"
          >
            <Link href={`/partner/${houseSlug}`}>
              <LayoutDashboard className="size-4" />
              <span>{tNav("dashboard")}</span>
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
