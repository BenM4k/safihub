"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle, RotateCcw, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CourierErrorViewProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
}

/**
 * Mobile-first error boundary component designed specifically for the courier PWA.
 * Sentry integration, accessible ARIA roles, offline-tolerant visual feedback.
 */
export function CourierErrorView({
  error,
  reset,
  title,
  description,
}: CourierErrorViewProps) {
  const tErrors = useTranslations("errors");
  const tNav = useTranslations("courier.nav");

  useEffect(() => {
    Sentry.captureException(error);
    console.error("Courier route error encountered:", error);
  }, [error]);

  const displayTitle = title || tErrors("technicalInterruption");
  const displayDescription =
    description || error.message || tErrors("criticalErrorDesc");

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="w-full max-w-md mx-auto my-6 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs text-center flex flex-col items-center"
    >
      {/* Icon Badge */}
      <div className="size-13 rounded-2xl bg-destructive-light text-destructive-base border border-destructive-base/20 flex items-center justify-center mb-4 shadow-2xs">
        <AlertTriangle className="size-6.5" />
      </div>

      {/* Heading */}
      <h1 className="font-display font-black text-lg text-slate-900 tracking-tight mb-1.5">
        {displayTitle}
      </h1>

      {/* Description */}
      <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto mb-4">
        {displayDescription}
      </p>

      {/* Optional Error Digest */}
      {error.digest && (
        <div className="w-full mb-4 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-500 text-center select-all">
          {tErrors("referenceCode")} : {error.digest}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-2.5 w-full">
        <Button
          type="button"
          variant="primary"
          onClick={() => reset()}
          className="w-full h-11 rounded-xl gap-2 font-bold text-xs shadow-xs"
        >
          <RotateCcw className="size-4" />
          <span>{tErrors("retry")}</span>
        </Button>

        <Button
          variant="outline"
          asChild
          className="w-full h-11 rounded-xl gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
        >
          <Link href="/courier">
            <Truck className="size-4" />
            <span>{tNav("missions")}</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
