"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import * as Sentry from "@sentry/nextjs";
import { AlertCircle, RotateCcw, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface AuthErrorCardProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
  showBackToLogin?: boolean;
}

/**
 * Reusable, high-fidelity error presentation for all authentication screens.
 * Aligns strictly with SafiHub design tokens: solid brand colors, clean card,
 * accessible ARIA roles, responsive touch targets, and multilingual next-intl copy.
 */
export function AuthErrorCard({
  error,
  reset,
  title,
  description,
  showBackToLogin = true,
}: AuthErrorCardProps) {
  const tAuth = useTranslations("auth");
  const tErrors = useTranslations("errors");

  useEffect(() => {
    Sentry.captureException(error);
    console.error("Auth boundary error encountered:", error);
  }, [error]);

  const displayTitle = title ?? tAuth("errorTitle");
  const displayDescription = description ?? tAuth("errorDesc");

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="w-full max-w-sm sm:max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-xs text-center flex flex-col items-center"
    >
      {/* Icon Badge */}
      <div className="size-14 rounded-2xl bg-destructive-light text-destructive-base border border-destructive-base/20 flex items-center justify-center mb-5 shadow-2xs">
        <AlertCircle className="size-7" />
      </div>

      {/* Heading */}
      <h1 className="text-xl sm:text-2xl font-black text-ink-900 tracking-tight font-display mb-2">
        {displayTitle}
      </h1>

      {/* Description */}
      <p className="text-xs sm:text-sm text-ink-600 leading-relaxed max-w-xs mx-auto mb-5">
        {displayDescription}
      </p>

      {/* Optional Error Digest */}
      {error.digest && (
        <div className="w-full mb-5 px-3 py-1.5 rounded-lg bg-ink-50 border border-ink-200 text-[11px] font-mono text-ink-500 select-all">
          {tErrors("referenceCode")}: {error.digest}
        </div>
      )}

      {/* Action Buttons */}
      <div className="w-full space-y-2.5">
        <Button
          type="button"
          variant="primary"
          size="pill"
          onClick={() => reset()}
          className="w-full gap-2 font-semibold shadow-xs"
        >
          <RotateCcw className="size-4" />
          <span>{tErrors("retry")}</span>
        </Button>

        {showBackToLogin ? (
          <Button
            variant="outline"
            size="pill"
            asChild
            className="w-full gap-2 border-border-strong text-ink-700 hover:bg-ink-50"
          >
            <Link href="/login">
              <ArrowLeft className="size-4" />
              <span>{tAuth("backToLogin")}</span>
            </Link>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="pill"
            asChild
            className="w-full gap-2 border-border-strong text-ink-700 hover:bg-ink-50"
          >
            <Link href="/">
              <Home className="size-4" />
              <span>{tErrors("backHome")}</span>
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
