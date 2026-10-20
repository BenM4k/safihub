"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import * as Sentry from "@sentry/nextjs";
import { AlertCircle, RotateCcw, Home, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CustomerErrorViewProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
  showHousesLink?: boolean;
}

/**
 * Standard, highly professional error boundary component for all customer-facing routes.
 * Integrates Sentry reporting, next-intl translations, accessible ARIA roles, and
 * SafiHub design tokens (royal indigo #2824D5, slate neutrals, rounded cards).
 */
export function CustomerErrorView({
  error,
  reset,
  title,
  description,
  showHousesLink = false,
}: CustomerErrorViewProps) {
  const t = useTranslations("errors");

  useEffect(() => {
    Sentry.captureException(error);
    console.error("Customer route error encountered:", error);
  }, [error]);

  const displayTitle = title || t("technicalInterruption");
  const displayDescription = description || t("criticalErrorDesc");

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="w-full max-w-lg mx-auto my-10 sm:my-16 p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-xs text-center flex flex-col items-center"
    >
      {/* Icon Badge */}
      <div className="size-14 rounded-2xl bg-destructive-light text-destructive-base border border-destructive-base/20 flex items-center justify-center mb-5 shadow-2xs">
        <AlertCircle className="size-7" />
      </div>

      {/* Headline */}
      <h1 className="font-display font-black text-xl sm:text-2xl text-slate-900 tracking-tight mb-2">
        {displayTitle}
      </h1>

      {/* Description */}
      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto mb-5">
        {displayDescription}
      </p>

      {/* Optional Error Digest */}
      {error.digest && (
        <div className="w-full mb-5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono text-slate-500 text-center select-all">
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

        {showHousesLink ? (
          <Button
            variant="outline"
            size="pill"
            asChild
            className="w-full sm:flex-1 gap-2 border-slate-200 text-slate-900 hover:bg-slate-50"
          >
            <Link href="/houses">
              <Sparkles className="size-4" />
              <span>{t("viewHouses")}</span>
            </Link>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="pill"
            asChild
            className="w-full sm:flex-1 gap-2 border-slate-200 text-slate-900 hover:bg-slate-50"
          >
            <Link href="/">
              <Home className="size-4" />
              <span>{t("backHome")}</span>
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
