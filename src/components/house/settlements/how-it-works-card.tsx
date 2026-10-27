"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, HelpCircle, ShieldCheck } from "lucide-react";

interface HowItWorksCardProps {
  commissionRatePercent: number;
  settlementDelayNotice: string;
}

export function HowItWorksCard({
  commissionRatePercent,
  settlementDelayNotice,
}: HowItWorksCardProps) {
  const t = useTranslations("house.settlements");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="py-2 border-t border-border/60">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full py-3 flex items-center justify-between gap-3 text-left hover:opacity-80 transition cursor-pointer min-h-[44px]"
      >
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <HelpCircle className="size-4" />
          </div>
          <div>
            <span className="text-sm font-bold text-foreground block">
              {t("howItWorksTitle")}
            </span>
            <span className="text-2xs text-muted-foreground">
              {t("howItWorksSubtitle")}
            </span>
          </div>
        </div>

        <ChevronDown
          className={`size-4 text-muted-foreground transition-transform duration-500 ease-in-out shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Smooth 500ms grid expansion animation */}
      <div
        className={`grid transition-all duration-500 ease-in-out ${
          isOpen
            ? "grid-rows-[1fr] opacity-100 mt-2"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden space-y-5 pb-3 text-xs text-muted-foreground leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-1">
            {/* Rule 1: Frequency */}
            <div className="border-l-2 border-primary/50 pl-3.5 space-y-1">
              <span className="font-bold text-foreground block text-xs">
                {t("ruleFrequencyTitle")}
              </span>
              <p className="text-2xs sm:text-xs">{t("ruleFrequencyDesc")}</p>
            </div>

            {/* Rule 2: Commission */}
            <div className="border-l-2 border-primary/50 pl-3.5 space-y-1">
              <span className="font-bold text-foreground block text-xs">
                {t("ruleCommissionTitle", { rate: commissionRatePercent })}
              </span>
              <p className="text-2xs sm:text-xs">
                {t("ruleCommissionDesc", { rate: commissionRatePercent })}
              </p>
            </div>

            {/* Rule 3: Delivery cutoff */}
            <div className="border-l-2 border-primary/50 pl-3.5 space-y-1">
              <span className="font-bold text-foreground block text-xs">
                {t("ruleDelayTitle")}
              </span>
              <p className="text-2xs sm:text-xs">
                {t("ruleDelayDesc", { notice: settlementDelayNotice })}
              </p>
            </div>

            {/* Rule 4: Disputes & Cancelled */}
            <div className="border-l-2 border-primary/50 pl-3.5 space-y-1">
              <span className="font-bold text-foreground block text-xs">
                {t("ruleDisputesTitle")}
              </span>
              <p className="text-2xs sm:text-xs">{t("ruleDisputesDesc")}</p>
            </div>
          </div>

          <div className="pl-3.5 py-1 text-foreground flex items-center gap-2.5 text-2xs">
            <ShieldCheck className="size-4 text-primary shrink-0" />
            <span>{t("supportNotice")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
