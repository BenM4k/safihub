"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import * as Sentry from "@sentry/nextjs";
import { AlertCircle, RotateCcw, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface AdminErrorViewProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
}

/**
 * Standard, robust error state component for the Admin Operations Console.
 */
export function AdminErrorView({
  error,
  reset,
  title,
  description,
}: AdminErrorViewProps) {
  const tErrors = useTranslations("errors");

  useEffect(() => {
    Sentry.captureException(error);
    console.error("Admin console error encountered:", error);
  }, [error]);

  const displayTitle = title || tErrors("technicalInterruption");
  const displayDescription =
    description || error.message || tErrors("criticalErrorDesc");

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="p-6 sm:p-8 my-6 bg-card rounded-2xl border border-destructive-base/30 shadow-xs max-w-xl mx-auto space-y-4 text-center"
    >
      <div className="size-12 rounded-xl bg-destructive-light text-destructive-base border border-destructive-base/30 flex items-center justify-center mx-auto shadow-2xs">
        <AlertCircle className="size-6" />
      </div>

      <div className="space-y-1.5">
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
          className="min-h-[40px] px-5 text-xs font-semibold gap-2 bg-primary hover:bg-primary-hover text-white w-full sm:w-auto"
        >
          <RotateCcw className="size-4" />
          <span>{tErrors("retry")}</span>
        </Button>

        <Button
          variant="outline"
          asChild
          className="min-h-[40px] px-5 text-xs font-semibold gap-2 border-border-strong text-heading hover:bg-surface w-full sm:w-auto"
        >
          <Link href="/admin">
            <LayoutDashboard className="size-4" />
            <span>Tableau de bord</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
