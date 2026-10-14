"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Cookie, Shield, Check, ChevronDown } from "lucide-react";
import type { CookiePreferences } from "./types";

interface WidgetCookiesProps {
  cookieConsent: CookiePreferences;
  onUpdateConsent: (consent: Partial<CookiePreferences>) => void;
}

export function WidgetCookies({
  cookieConsent,
  onUpdateConsent,
}: WidgetCookiesProps) {
  const t = useTranslations("preferences");
  const [isExpanded, setIsExpanded] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const handleToggleAnalytics = () => {
    onUpdateConsent({ analytics: !cookieConsent.analytics });
    triggerSavedFeedback();
  };

  const handleTogglePreferences = () => {
    onUpdateConsent({ preferences: !cookieConsent.preferences });
    triggerSavedFeedback();
  };

  const handleAcceptAll = () => {
    onUpdateConsent({ analytics: true, preferences: true });
    triggerSavedFeedback();
  };

  const triggerSavedFeedback = () => {
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  return (
    <section className="px-4 py-3 border-b border-slate-100 dark:border-white/10">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex items-center justify-between w-full text-left group"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <Cookie className="size-4 text-primary" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-heading transition-colors">
            {t("cookiesSection")}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {justSaved && (
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <Check className="size-3" />
              {t("cookieConsentSaved")}
            </span>
          )}
          <ChevronDown
            className={`size-3.5 text-muted-foreground transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isExpanded && (
        <div className="flex flex-col gap-2.5 mt-3 pt-2 border-t border-slate-100 dark:border-white/5 animate-in fade-in duration-150">
          <p className="text-[11px] text-muted-foreground leading-snug">
            {t("cookiesDesc")}
          </p>

          {/* 1. Essential Cookies */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5">
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-xs font-semibold text-heading flex items-center gap-1">
                <Shield className="size-3.5 text-muted-foreground" />
                {t("essentialCookies")}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                {t("essentialCookiesDesc")}
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase text-muted-foreground bg-slate-200/60 dark:bg-white/10 px-2 py-0.5 rounded-full shrink-0">
              {t("cookieAlwaysActive")}
            </span>
          </div>

          {/* 2. Analytics Cookies */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5">
            <div className="flex flex-col min-w-0 pr-2">
              <span id="cookie-analytics-title" className="text-xs font-semibold text-heading">
                {t("analyticsCookies")}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                {t("analyticsCookiesDesc")}
              </span>
            </div>
            <button
              type="button"
              role="switch"
              id="cookie-analytics-switch"
              aria-labelledby="cookie-analytics-title"
              aria-checked={cookieConsent.analytics}
              onClick={handleToggleAnalytics}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                cookieConsent.analytics
                  ? "bg-primary"
                  : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block size-4 rounded-full bg-white shadow transform transition duration-200 ease-in-out ${
                  cookieConsent.analytics ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* 3. Preferences Cookies */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5">
            <div className="flex flex-col min-w-0 pr-2">
              <span id="cookie-preferences-title" className="text-xs font-semibold text-heading">
                {t("preferencesCookies")}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                {t("preferencesCookiesDesc")}
              </span>
            </div>
            <button
              type="button"
              role="switch"
              id="cookie-preferences-switch"
              aria-labelledby="cookie-preferences-title"
              aria-checked={cookieConsent.preferences}
              onClick={handleTogglePreferences}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                cookieConsent.preferences
                  ? "bg-primary"
                  : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block size-4 rounded-full bg-white shadow transform transition duration-200 ease-in-out ${
                  cookieConsent.preferences ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Quick Accept All button */}
          <button
            type="button"
            onClick={handleAcceptAll}
            className="w-full py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 rounded-xl transition-colors mt-1"
          >
            {t("acceptAllCookies")}
          </button>
        </div>
      )}
    </section>
  );
}
