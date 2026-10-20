"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle, RotateCcw, LayoutDashboard } from "lucide-react";
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
      className="rounded-3xl border border-destructive/20 bg-destructive-soft/50 p-6 sm:p-10 text-center max-w-xl mx-auto my-12 space-y-4"
    >
      <div className="size-14 rounded-2xl bg-destructive-soft text-destructive flex items-center justify-center mx-auto shadow-xs">
        <AlertTriangle className="size-7" />
      </div>

      <div className="space-y-1">
        <h2 className="font-display font-black text-lg text-heading">
          {displayTitle}
        </h2>
        <p className="text-xs sm:text-sm text-foreground max-w-md mx-auto leading-relaxed">
          {displayDescription}
        </p>
      </div>

      {error.digest && (
        <div className="w-full max-w-xs mx-auto p-2 rounded-xl bg-card border border-border text-[11px] font-mono text-muted-foreground select-all">
          {tErrors("referenceCode")} : {error.digest}
        </div>
      )}

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button
          type="button"
          onClick={() => reset()}
          className="rounded-xl font-bold bg-primary hover:bg-primary-hover text-primary-foreground text-xs px-5 h-10 gap-2 cursor-pointer w-full sm:w-auto"
        >
          <RotateCcw className="size-4" />
          <span>{t("retry")}</span>
        </Button>

        {houseSlug && (
          <Button
            variant="outline"
            asChild
            className="rounded-xl font-semibold border-border bg-card text-heading hover:bg-muted text-xs px-5 h-10 gap-2 w-full sm:w-auto"
          >
            <Link href={`/partner/${houseSlug}`}>
              <LayoutDashboard className="size-4" />
              <span>Tableau de bord</span>
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
