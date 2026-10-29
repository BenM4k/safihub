"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Lightbulb,
  ChevronDown,
  Sparkles,
} from "lucide-react";

interface CatalogueSetupGuideProps {
  defaultExpanded?: boolean;
}

export function CatalogueSetupGuide({ defaultExpanded = true }: CatalogueSetupGuideProps) {
  const t = useTranslations("house.catalogue");
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="pt-4 sm:pt-5 border-t border-border/60 text-sm space-y-3.5 font-sans">
      {/* Header with inline toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <Lightbulb className="size-4.5 text-primary shrink-0" aria-hidden="true" />
          <span className="font-bold text-heading text-sm sm:text-base font-display tracking-tight truncate">
            {t("setupGuideTitle")}
          </span>
          <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 hidden sm:inline truncate">
            — {t("setupGuideSubtitle")}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs sm:text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1 shrink-0 cursor-pointer bg-transparent border-0 p-0"
        >
          <span>{isExpanded ? t("setupGuideToggleHide") : t("setupGuideToggleShow")}</span>
          <ChevronDown
            className={`size-4 text-primary transition-transform duration-500 ease-in-out ${
              isExpanded ? "rotate-180" : "rotate-0"
            }`}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Expanded Content with slow, smooth transition */}
      <div
        className={`grid transition-all duration-500 ease-in-out ${
          isExpanded
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0 pointer-events-none"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 pt-1">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 sm:hidden">
              {t("setupGuideSubtitle")}
            </p>

            {/* 3 Numbered Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-1">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-mono text-xs font-bold mt-0.5">
                  1
                </span>
                <div className="space-y-1">
                  <h4 className="font-bold text-heading text-sm">
                    {t("setupGuideStep1Title")}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t("setupGuideStep1Desc")}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-mono text-xs font-bold mt-0.5">
                  2
                </span>
                <div className="space-y-1">
                  <h4 className="font-bold text-heading text-sm">
                    {t("setupGuideStep2Title")}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t("setupGuideStep2Desc")}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold mt-0.5">
                  3
                </span>
                <div className="space-y-1">
                  <h4 className="font-bold text-heading text-sm">
                    {t("setupGuideStep3Title")}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t("setupGuideStep3Desc")}
                  </p>
                </div>
              </div>
            </div>

            {/* Practical Example & Tip with hairline left accent */}
            <div className="border-l-2 border-primary/50 pl-4 py-2 space-y-2 mt-3 bg-muted/20 rounded-r-xl">
              <div className="flex items-center gap-1.5 text-primary font-bold text-xs sm:text-sm">
                <Sparkles className="size-4 text-primary" aria-hidden="true" />
                <span>{t("setupGuideExampleTitle")}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong className="text-heading font-semibold mr-1">{t("setupGuideExampleItem")}</strong>
                <span>{t("setupGuideExampleStep")}</span>
              </p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2 border-t border-border/40">
                <strong className="text-heading font-semibold mr-1">{t("setupGuideTipTitle")}</strong>
                <span>{t("setupGuideTipDesc")}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
