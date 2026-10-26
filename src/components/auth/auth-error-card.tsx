"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import * as Sentry from "@sentry/nextjs";
import { AlertCircle, RotateCcw, ArrowLeft, Home } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
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
 * Composes shadcn Card with SafiHub design tokens: solid brand colors, clean card,
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
    <Card
      role="alert"
      aria-live="assertive"
      className="w-full max-w-sm sm:max-w-md mx-auto rounded-3xl border-border shadow-xs text-center flex flex-col items-center p-6 sm:p-8"
    >
      <CardHeader className="p-0 flex flex-col items-center">
        {/* Icon Badge */}
        <div className="size-14 rounded-2xl bg-destructive-soft text-destructive border border-destructive/20 flex items-center justify-center mb-5 shadow-2xs">
          <AlertCircle className="size-7" />
        </div>

        {/* Heading */}
        <CardTitle className="text-xl sm:text-2xl font-black text-heading tracking-tight font-display mb-2">
          {displayTitle}
        </CardTitle>

        {/* Description */}
        <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
          {displayDescription}
        </CardDescription>
      </CardHeader>

      {/* Optional Error Digest */}
      {error.digest && (
        <CardContent className="w-full p-0 mt-5">
          <div className="w-full px-3 py-1.5 rounded-lg bg-muted border border-border text-[11px] font-mono text-muted-foreground select-all">
            {tErrors("referenceCode")}: {error.digest}
          </div>
        </CardContent>
      )}

      {/* Action Buttons */}
      <CardFooter className="w-full p-0 mt-6 flex flex-col gap-2.5">
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
            className="w-full gap-2 border-border-strong text-foreground hover:bg-muted"
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
            className="w-full gap-2 border-border-strong text-foreground hover:bg-muted"
          >
            <Link href="/">
              <Home className="size-4" />
              <span>{tErrors("backHome")}</span>
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
