"use client";

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { Sparkles, RefreshCw, Home, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import fr from "../../messages/fr.json";
import en from "../../messages/en.json";
import sw from "../../messages/sw.json";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const ERROR_TRANSLATIONS = { fr, en, sw };

function getInitialLocale(): "fr" | "en" | "sw" {
  if (typeof document === "undefined") return "fr";
  const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
  const savedLocale = match?.[1];
  return savedLocale === "en" || savedLocale === "sw" || savedLocale === "fr"
    ? savedLocale
    : "fr";
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const router = useRouter();
  const [locale] = useState<"fr" | "en" | "sw">(getInitialLocale);

  useEffect(() => {
    // Capture root unhandled error in Sentry
    Sentry.captureException(error);
    console.error("Global application boundary error:", error);
  }, [error]);


  const t = ERROR_TRANSLATIONS[locale].errors;
  const tCommon = ERROR_TRANSLATIONS[locale].common;

  return (
    <html lang={locale} className="h-full font-sans antialiased">
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900 justify-center items-center p-4 sm:p-6">
        <div className="w-full max-w-lg p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-lg text-center flex flex-col items-center">
          {/* Brand header */}
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="size-6 text-brand-600 fill-brand-600" />
            <span className="font-black text-2xl tracking-tight text-ink-900">
              {tCommon.brand}<span className="text-brand-600">.</span>
            </span>
          </div>

          {/* Alert icon badge */}
          <div className="size-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 mb-6">
            <ShieldAlert className="size-8" />
          </div>

          {/* Headline */}
          <h1 className="font-black text-2xl sm:text-3xl tracking-tight text-ink-900 mb-3">
            {t.technicalInterruption}
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
            {t.criticalErrorDesc}
          </p>

          {/* Optional error digest */}
          {error.digest && (
            <div className="w-full mb-6 p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono text-slate-500 text-center select-all">
              {t.referenceCode} : {error.digest}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-xs cursor-pointer"
            >
              <RefreshCw className="size-4" />
              {t.retry}
            </button>
            <button
              type="button"
              onClick={() => {
                router.push("/");
              }}
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold border border-slate-200 bg-white text-ink-900 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            >
              <Home className="size-4" />
              {t.backHome}
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

