"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import * as Sentry from "@sentry/nextjs";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface LegalErrorCardProps {
  error: Error & { digest?: string };
  reset: () => void;
  documentTitle?: string;
}

/**
 * Professional, accessible error state presentation for SafiHub legal pages.
 */
export function LegalErrorCard({
  error,
  reset,
  documentTitle,
}: LegalErrorCardProps) {
  const t = useTranslations("errors");

  useEffect(() => {
    Sentry.captureException(error);
    console.error("Legal page error boundary triggered:", error);
  }, [error]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="w-full max-w-lg mx-auto p-8 sm:p-12 rounded-3xl bg-card border border-border shadow-xs text-center flex flex-col items-center my-8"
    >
      {/* Icon Badge */}
      <div className="size-14 rounded-2xl bg-destructive-soft text-destructive border border-destructive/20 flex items-center justify-center mb-5 shadow-2xs">
        <AlertCircle className="size-7" />
      </div>

      {/* Heading */}
      <h1 className="font-display font-black text-2xl sm:text-3xl text-heading tracking-tight mb-2">
        {documentTitle ? `${documentTitle} : ${t("generic")}` : t("generic")}
      </h1>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto mb-6">
        {t("criticalErrorDesc")}
      </p>

      {/* Digest Reference */}
      {error.digest && (
        <div className="w-full mb-6 p-2.5 rounded-xl bg-muted border border-border text-xs font-mono text-muted-foreground text-center select-all">
          {t("referenceCode")} : {error.digest}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
        <Button
          type="button"
          variant="primary"
          size="pill"
          onClick={() => reset()}
          className="w-full sm:flex-1 gap-2 font-semibold shadow-xs"
        >
          <RotateCcw className="size-4" />
          <span>{t("retry")}</span>
        </Button>

        <Button
          variant="outline"
          size="pill"
          asChild
          className="w-full sm:flex-1 gap-2 border-border text-heading hover:bg-muted"
        >
          <Link href="/">
            <Home className="size-4" />
            <span>{t("backHome")}</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
